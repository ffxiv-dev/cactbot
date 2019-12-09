using RainbowMage.OverlayPlugin;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace Cactbot {
  class VersionChecker {
    private ILogger logger_ = null;

    public VersionChecker(ILogger logger) {
      logger_ = logger;
    }

    private Advanced_Combat_Tracker.ActPluginData GetCactbotPluginData() {
      foreach (var plugin in Advanced_Combat_Tracker.ActGlobals.oFormActMain.ActPlugins) {
        if (!plugin.cbEnabled.Checked)
          continue;
        var file = plugin.pluginFile.Name;
        if (file == "CactbotOverlay.dll") {
          return plugin;
        }
      }
      return null;
    }

    public Version GetLocalVersion() {
      var plugin = GetCactbotPluginData();
      if (plugin == null)
        return new Version();
      return new Version(System.Diagnostics.FileVersionInfo.GetVersionInfo(plugin.pluginFile.FullName).FileVersion);
    }

    public string GetCactbotLocation() {
      var plugin = GetCactbotPluginData();
      if (plugin == null)
        return "(unknown)";
      return plugin.pluginFile.FullName;
    }

    public string GetCactbotBaseDirectory() {
      var plugin = GetCactbotPluginData();
      if (plugin == null)
        return null;
      return plugin.pluginFile.DirectoryName;
    }

    public Version GetOverlayPluginVersion() {
      return System.Reflection.Assembly.GetAssembly(typeof(IOverlay)).GetName().Version;
    }

    public string GetOverlayPluginLocation() {
      return System.Reflection.Assembly.GetAssembly(typeof(IOverlay)).Location;
    }

    private Advanced_Combat_Tracker.ActPluginData GetFFXIVPluginData() {
      foreach (var plugin in Advanced_Combat_Tracker.ActGlobals.oFormActMain.ActPlugins) {
        if (!plugin.cbEnabled.Checked)
          continue;
        var file = plugin.pluginFile.Name;
        if (file == "FFXIV_ACT_Plugin.dll") {
          return plugin;
        }
      }
      return null;
    }

    public Version GetFFXIVPluginVersion() {
      var plugin = GetFFXIVPluginData();
      if (plugin == null)
        return new Version();
      return new Version(System.Diagnostics.FileVersionInfo.GetVersionInfo(plugin.pluginFile.FullName).FileVersion);
    }

    public string GetFFXIVPluginLocation() {
      var plugin = GetFFXIVPluginData();
      if (plugin == null)
        return "(unknown)";
      return plugin.pluginFile.FullName;
    }

    public Version GetACTVersion() {
      return System.Reflection.Assembly.GetAssembly(typeof(Advanced_Combat_Tracker.ActGlobals)).GetName().Version;
    }

    public string GetACTLocation() {
      return System.Reflection.Assembly.GetAssembly(typeof(Advanced_Combat_Tracker.ActGlobals)).Location;
    }

    public void DoUpdateCheck(Control control, Cactbot.CactbotEventSourceConfig config) {
      string pluginDirectory = GetCactbotBaseDirectory();
      if (pluginDirectory == null) {
        logger_.LogInfo("Ignoring update check due to unknown base directory.");
        return;
      }

      Updater.PerformUpdateIfNecessary(control, pluginDirectory, config);
    }
  }
}  // namespace Cactbot
