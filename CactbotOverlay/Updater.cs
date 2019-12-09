using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Reflection;
using Newtonsoft.Json.Linq;
using RainbowMage.OverlayPlugin.Updater;

// Borrowed from:
// https://github.com/ngld/OverlayPlugin/blob/4f5b522fe08aaa2eb9536e216a0f5b8d731c07a6/OverlayPlugin.Updater/Updater.cs
// ... with some minor string replacements.

namespace Cactbot
{
    public class Updater
    {
        public static string cbStr(string input)
        {
            return input.Replace("OverlayPlugin", "Cactbot");
        }

        public static DialogResult cbMessageBoxShow(string text, string caption, MessageBoxButtons buttons, MessageBoxIcon icon)
        {
            return MessageBox.Show(cbStr(text), cbStr(caption), buttons, icon);
        }

        const string REL_URL = "https://api.github.com/repos/quisquous/cactbot/releases";
        const string DL = "https://github.com/quisquous/cactbot/releases/download/v{VERSION}/cactbot-{VERSION}.zip";

        public static Task<(bool, Version, string)> CheckForUpdate(Control parent)
        {
            return Task.Run(() =>
            {
                var currentVersion = Assembly.GetExecutingAssembly().GetName().Version;
                Version remoteVersion;
                string response;
                try
                {
                    response = CurlWrapper.Get(REL_URL);
                }
                catch (CurlException ex)
                {
                    cbMessageBoxShow(string.Format(Resources.UpdateCheckException, ex.ToString()), Resources.UpdateCheckTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return (false, null, "");
                }

                var releaseNotes = "";
                try
                {
                    // JObject doesn't accept arrays so we have to package the response in a JSON object.
                    var tmp = JObject.Parse("{\"content\":" + response + "}");
                    remoteVersion = Version.Parse(tmp["content"][0]["tag_name"].ToString().Substring(1));

                    foreach (var rel in tmp["content"])
                    {
                        var version = Version.Parse(rel["tag_name"].ToString().Substring(1));
                        if (version.CompareTo(currentVersion) < 1) break;

                        releaseNotes += "---\n\n# " + rel["name"].ToString() + "\n\n" + rel["body"].ToString() + "\n\n";
                    }

                    if (releaseNotes.Length > 5)
                    {
                        releaseNotes = releaseNotes.Substring(5);
                    }
                }
                catch (Exception ex)
                {
                    parent.Invoke((Action) (() =>
                    {
                        cbMessageBoxShow(string.Format(Resources.UpdateParseVersionError, ex.ToString()), Resources.UpdateTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }));
                    return (false, null, null);
                }

                return (remoteVersion.CompareTo(currentVersion) > 0, remoteVersion, releaseNotes);
            });
        }

        public static async Task<bool> InstallUpdate(Version version, string pluginDirectory)
        {
            var url = DL.Replace("{VERSION}", version.ToString());

            var result = await Installer.Run(url, pluginDirectory, true);
            if (!result)
            {
                var response = cbMessageBoxShow(
                    Resources.UpdateFailedError,
                    Resources.ErrorTitle,
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning
                );

                if (response == DialogResult.Yes)
                {
                    return await InstallUpdate(version, pluginDirectory);
                }
                else
                {
                    return false;
                }
            }
            else
            {
                cbMessageBoxShow(
                    Resources.UpdateSuccess,
                    Resources.UpdateTitle,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );

                return true;
            }
        }

        public static async void PerformUpdateIfNecessary(Control parent, string pluginDirectory, Cactbot.CactbotEventSourceConfig config, bool manualCheck = false)
        {
            // Only check once per day.
            if (!manualCheck && config.LastUpdateCheck != null && (DateTime.Now - config.LastUpdateCheck).TotalDays < 1)
            {
                return;
            }

            var (newVersion, remoteVersion, releaseNotes) = await CheckForUpdate(parent);

            if (remoteVersion != null)
            {
                config.LastUpdateCheck = DateTime.Now;
            }

            if (newVersion)
            {
                // Make sure we open the UpdateQuestionForm on a UI thread.
                parent.Invoke((Action)(async () =>
                 {
                     var dialog = new UpdateQuestionForm(releaseNotes);
                     var result = dialog.ShowDialog();
                     dialog.Dispose();

                     if (result == DialogResult.Yes)
                     {
                         await InstallUpdate(remoteVersion, pluginDirectory);
                     }
                 }));
            } else if (manualCheck && remoteVersion != null)
            {
                parent.Invoke((Action)(() =>
                {
                    cbMessageBoxShow(Resources.UpdateAlreadyLatest, Resources.UpdateTitle, MessageBoxButtons.OK, MessageBoxIcon.Information);
                }));
            }
        }
    }
}
