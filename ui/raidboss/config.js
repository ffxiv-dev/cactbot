'use strict';

// TODO: maybe this file should live in ui/raidboss/config.js?
// and then this can include it from there.
// This would then let raidboss.js set its options from this
// without duplicating a default let Options = {} block.
// Even better, maybe raidboss-example.js can be generated
// from this file.

// TODO: option groups

// TODO: be able to link to other options?

[{
  options: [
    {
      id: 'SpokenAlertsEnabled',
      name: {
        en: 'Spoken Alerts (Text To Speech)',
      },
      desc: {
        en: 'When set, this will turn all text alerts into text to speech.',
      },
      type: 'checkbox',
      default: false,
    },
    {
      id: 'AlertsLanguage',
      name: {
        en: 'Alerts Language',
      },
      desc: {
        en: 'What language to show text alerts in and to play tts in. ' +
          'By default, cactbot picks the language that ACT is parsing in. ' +
          'This options overrides that, and is meant for testing other languages.',
      },
      type: 'select',
      options: {
        en: {
          'Use FFXIV Plugin Language': undefined,
          'English (en)': 'en',
          'Chinese (cn)': 'cn',
          'German (de)': 'de',
          'French (fr)': 'fr',
          'Japanese (ja)': 'ja',
          'Korean (ko)': 'ko',
        },
      },
      default: 'Use FFXIV Plugin Language',
      debug: true,
    },
    {
      id: 'Skin',
      name: {
        en: 'Raidboss Skin',
      },
      desc: {
        en: '',
      },
      type: 'select',
      options: {
        en: {
          'Default': 'default',
          'lippe': 'lippe',
        },
      },
      default: 'default',
    },
    {
      id: 'TimelineEnabled',
      name: {
        en: 'Timeline Enabled',
      },
      desc: {
        en: 'Whether or not to show the timeline of upcoming events on screen.\n' +
          'Using raidboss_alerts_only.html or raidboss_timeline_only.html ' +
          'takes precedence over this option.',
      },
      type: 'checkbox',
      default: true,
    },
    {
      id: 'TextAlertsEnabled',
      name: {
        en: 'Text Alerts Enabled',
      },
      desc: {
        en: 'Whether or not to show the timeline of upcoming events on screen.\n' +
          'Using raidboss_alerts_only.html or raidboss_timeline_only.html ' +
          'takes precedence over this option.',
      },
      type: 'checkbox',
      default: true,
    },
    {
      id: 'ShowTimerBarsAtSeconds',
      name: {
        en: 'Show Timer Bars At Seconds',
      },
      desc: {
        en: 'Show timer bars for events that will happen in this many seconds or less.',
      },
      type: 'float',
      default: 30,
    },
    {
      id: 'MaxNumberOfTimerBars',
      name: {
        en: 'Maximum Number of Timer Bars',
      },
      desc: {
        en: 'Number of timeline bars to show at most.  ' +
          'This is also affected by the ShowTimerBarsAtSeconds option.',
      },
      type: 'integer',
      default: 6,
    },
  ],
}];
