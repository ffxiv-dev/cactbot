'use strict';

let Options = {

};

let gConfig = null;

let kPrefixToCategory = {
  '00-misc': {
    en: 'General',
  },
  '02-arr': {
    en: 'A Realm Reborn (ARR 2.x)',
  },
  '03-hw': {
    en: 'Heavensward (HW 3.x)',
  },
  '04-sb': {
    en: 'Stormblood (SB 4.x)',
  },
  '05-shb': {
    en: 'Shadowbringers (ShB 5.x)',
  },
};

let kDirectoryToCategory = {
  alliance: {
    en: 'Alliance Raid',
  },
  dungeon: {
    en: 'Dungeon',
  },
  eureka: {
    en: 'Eureka',
  },
  general: {
    en: 'General',
  },
  raid: {
    en: 'Raid',
  },
  pvp: {
    en: 'PVP',
  },
  trial: {
    en: 'Trial',
  },
  ultimate: {
    en: 'Ultimate',
  },
};

let kTriggerEnableOptions = {
  enabled: {
    en: 'Enabled',
  },
  hidden: {
    en: 'Hidden',
  },
  disabled: {
    en: 'Disabled',
  },
};

let kTriggerOutputOptions = {
  default: {
    en: 'Default',
  },
  ttsOnly: {
    en: 'Play TTS',
  },
  ttsAndText: {
    en: 'Text and TTS',
  },
  textAndSound: {
    en: 'Text and Sound',
  },
};

let kDetailKeys = {
  'triggerRegex': {
    label: {
      en: 'regex',
    },
    cls: 'regex-text',
  },
  'timelineRegex': {
    label: {
      en: 'timeline',
    },
    cls: 'regex-text',
  },
  'alarmText': {
    label: {
      en: 'alarm',
    },
    cls: 'alarm-text',
  },
  'alertText': {
    label: {
      en: 'alert',
    },
    cls: 'alert-text',
  },
  'infoText': {
    label: {
      en: 'info',
    },
    cls: 'info-text',
  },
  'tts': {
    label: {
      en: 'tts',
    },
    cls: 'tts-text',
  },
  'sound': {
    label: {
      en: 'sound',
    },
    cls: 'sound-text',
  },
};

class CactbotConfigurator {
  constructor(configFiles, raidbossFiles, options) {
    this.contents = [];
    this.options = options;

    for (let filename in configFiles) {
      let content;
      try {
        content = eval(configFiles[filename]);
      } catch (exception) {
        console.log('Error parsing JSON from ' + filename + ': ' + exception);
        continue;
      }
      this.contents.push(...content);
    }

    let container = document.getElementById('container');
    this.buildUI(container, this.contents);
    this.buildRaidbossUI(container, raidbossFiles);
  }

  buildUI(container, contents) {
    for (let i = 0; i < contents.length; ++i) {
      let options = contents[i].options;
      if (!options)
        continue;
      for (let j = 0; j < options.length; ++j) {
        let opt = options[j];
        let buildFunc = {
          checkbox: this.buildCheckbox,
          select: this.buildSelect,
          float: this.buildFloat,
          integer: this.buildInteger,
          directory: this.buildDirectory,
        }[opt.type];
        if (!buildFunc) {
          console.error('unknown type: ' + JSON.stringify(opt));
          continue;
        }
        (buildFunc.bind(this))(container, opt);
      }
    }
  }

  translate(textObj) {
    if (textObj === null || typeof textObj !== 'object' || !textObj['en'])
      return textObj;
    let t = textObj[this.options.Language];
    if (t)
      return t;
    return textObj['en'];
  }

  valueOrFunction(f, data, matches) {
    let result = (typeof(f) == 'function') ? f(data, matches) : f;
    if (result !== Object(result))
      return result;
    // TODO: somehow use the option for alert language here??
    let lang = this.options.Language || 'en';
    if (result[lang])
      return this.valueOrFunction(result[lang]);
    // For partially localized results where this localization doesn't
    // exist, prefer English over nothing.
    return this.valueOrFunction(result['en']);
  }

  buildNameDiv(opt) {
    let div = document.createElement('div');
    div.id = 'name-' + opt.id;
    div.innerHTML = this.translate(opt.name);
    return div;
  }

  buildCheckbox(parent, opt) {
    let div = document.createElement('div');
    let input = document.createElement('input');
    div.appendChild(input);
    input.type = 'checkbox';
    input.name = 'input-' + opt.id;
    input.checked = opt.default;

    parent.appendChild(this.buildNameDiv(opt));
    parent.appendChild(div);
  }

  buildSelect(parent, opt) {
    let div = document.createElement('div');
    let input = document.createElement('select');
    div.appendChild(input);
    input.name = 'input-' + opt.id;

    let innerOptions = this.translate(opt.options);
    for (let key in innerOptions) {
      let elem = document.createElement('option');
      elem.value = innerOptions[key];
      elem.innerHTML = key;
      if (key == opt.default)
        elem.selected = true;
      input.appendChild(elem);
    }

    parent.appendChild(this.buildNameDiv(opt));
    parent.appendChild(div);
  }

  buildFloat(parent, opt) {
    let div = document.createElement('div');
    let input = document.createElement('input');
    div.appendChild(input);
    input.type = 'number';
    input.step = 'any';
    input.name = 'input-' + opt.id;
    input.value = opt.default;

    parent.appendChild(this.buildNameDiv(opt));
    parent.appendChild(div);
  }

  buildInteger(parent, opt) {
    let div = document.createElement('div');
    let input = document.createElement('input');
    div.appendChild(input);
    input.type = 'number';
    input.step = 1;
    input.name = 'input-' + opt.id;
    input.value = opt.default;

    parent.appendChild(this.buildNameDiv(opt));
    parent.appendChild(div);
  }

  buildDirectory(parent, opt) {
    let div = document.createElement('div');
    let input = document.createElement('input');
    div.appendChild(input);
    input.type = 'file';
    input.webkitdirectory = true;
    input.name = 'input-' + opt.id;

    parent.appendChild(this.buildNameDiv(opt));
    parent.appendChild(div);
  }

  processTrigger(trig) {
    let kBaseFakeData = {
      party: new PartyTracker(),
      lang: this.options.Language,
      currentHP: 1000,
      options: this.options,
      ShortName: (x) => x,
      StopCombat: () => {},
      ParseLocaleFloat: parseFloat,
      CanStun: () => Util.canStun(this.job),
      CanSilence: () => Util.canSilence(this.job),
      CanSleep: () => Util.canSleep(this.job),
      CanCleanse: () => Util.canCleanse(this.job),
      CanFeint: () => Util.canFeint(this.job),
      CanAddle: () => Util.canAddle(this.job),
    };

    let kFakeData = [
      {
        me: 'Tini Poutini',
        job: 'GNB',
        role: 'tank',
      },
      {
        me: 'Potato Chippy',
        job: 'WHM',
        role: 'healer',
      },
      {
        me: 'Tater Tot',
        job: 'BLM',
        role: 'dps',
      },
      {
        me: 'Hash Brown',
        job: 'DRG',
        role: 'dps',
      },
      {
        me: 'Aloo Gobi',
        job: 'BLU',
        role: 'dps',
      },
    ];

    for (let i = 0; i < kFakeData.length; ++i)
      kFakeData[i] = Object.assign({}, kFakeData[i], kBaseFakeData);


    let kFakeMatches = {
      // TODO: really should convert all triggers to use regexes.js.
      // Mooooost triggers use matches[1] to be a name.
      1: kFakeData[0].me,

      sourceId: '41234567',
      source: 'Enemy',
      id: '1234',
      ability: 'Ability',
      targetId: '1234567',
      target: kFakeData[0].me,
      flags: '',
      x: 100,
      y: 100,
      z: 0,
      heading: 0,
      npcId: undefined,
      effect: 'Effect',
      duration: 30,
      code: '00',
      line: '',
      name: 'Name',
      capture: true,
    };

    // Try to determine some sample output?
    // This could get much more complicated if we wanted it to.
    // One easy followup is to try to figure out which cares about role,
    // either just by spamming different roles, or using some proxy object
    // that can tell when data.role is accessed, or hacky regex??
    let output = {};
    let keys = ['alarmText', 'alertText', 'infoText', 'tts', 'sound'];
    for (let i = 0; i < keys.length; ++i) {
      let key = keys[i];
      if (!trig[key])
        continue;

      for (let d = 0; d < kFakeData.length; ++d) {
        try {
          let result = this.valueOrFunction(trig[key], kFakeData[d], kFakeMatches);
          if (!result)
            continue;

          // Super hack:
          if (result.indexOf('undefined') >= 0 || result.indexOf('NaN') >= 0)
            continue;

          output[key] = result;
          break;
        } catch (e) {
          // This is all totally bogus.  Many triggers assume fields on data
          // are properly defined when these calls happen, so will throw errors.
          // So just silently ignore.
          continue;
        }
      }
    }

    trig.output = output;

    let locale = this.options.Language;
    let regexLocale = 'regex' + locale.charAt(0).toUpperCase() + locale.slice(1);
    let reg = Regexes.parse(trig[regexLocale] || trig.regex);

    if (trig.isTimelineTrigger)
      trig.timelineRegex = reg;
    else
      trig.triggerRegex = reg;

    return trig;
  }

  processRaidbossFiles(raidbossFiles) {
    let map = {};
    for (let filename in raidbossFiles) {
      if (!filename.endsWith('.js'))
        continue;

      let prefix = '00-misc';
      for (let str in kPrefixToCategory) {
        if (!filename.startsWith(str))
          continue;
        prefix = str;
        break;
      }

      let type = 'general';
      for (let str in kDirectoryToCategory) {
        if (filename.indexOf('/' + str + '/') == -1)
          continue;
        type = str;
        break;
      }

      // TODO: maybe raidboss should expose a bunch of its
      let json;
      try {
        json = eval(raidbossFiles[filename]);
      } catch (exception) {
        console.log('Error parsing JSON from ' + filename + ': ' + exception);
        continue;
      }

      // TODO: maybe each trigger set needs a zone name, and we should
      // use that instead of the filename???
      let rawTriggers = {
        trigger: [],
        timeline: [],
      };
      for (let i = 0; i < json.length; ++i) {
        let triggerSet = json[i];
        if (triggerSet.triggers)
          rawTriggers.trigger.push(...triggerSet.triggers);
        if (triggerSet.timelineTriggers)
          rawTriggers.timeline.push(...triggerSet.timelineTriggers);
      }

      let triggers = {};
      for (let key in rawTriggers) {
        let triggerList = rawTriggers[key];
        for (let i = 0; i < triggerList.length; ++i) {
          let trig = triggerList[i];
          if (!trig.id) {
            // TODO: add testing that all triggers have a globally unique id.
            // console.error('missing trigger id in ' + filename + ': ' + JSON.stringify(trig));
            continue;
          }

          trig.isTimelineTrigger = key === 'timeline';
          triggers[trig.id] = this.processTrigger(trig);
        }
      }

      let fileKey = filename.replace(/\//g, '-').replace(/.js$/, '');
      map[fileKey] = {
        filename: filename,
        fileKey: fileKey,
        prefix: prefix,
        type: type,
        json: json,
        triggers: triggers,
      };
    }
    return map;
  }

  buildTriggerOptions(trig) {
    let div = document.createElement('div');
    div.classList.add('trigger-options');

    let selects = {
      enable: kTriggerEnableOptions,
      output: kTriggerOutputOptions,
    };
    for (let type in selects) {
      let input = document.createElement('select');
      div.appendChild(input);
      input.name = 'enable-' + trig.id;

      let options = selects[type];
      for (let key in options) {
        let elem = document.createElement('option');
        elem.value = key;
        elem.innerHTML = this.translate(options[key]);
        input.appendChild(elem);
      }
    }

    return div;
  }

  buildRaidbossUI(container, raidbossFiles) {
    this.raidboss = this.processRaidbossFiles(raidbossFiles);

    for (let k in this.raidboss) {
      let info = this.raidboss[k];

      if (Object.keys(info.triggers).length == 0)
        continue;

      let nameDiv = document.createElement('div');
      nameDiv.id = 'name-' + k;
      nameDiv.innerHTML = info.filename;
      nameDiv.classList.add('section');

      container.appendChild(nameDiv);

      let triggerContainer = document.createElement('div');
      triggerContainer.classList.add('trigger-group');
      container.appendChild(triggerContainer);

      for (let id in info.triggers) {
        let trig = info.triggers[id];

        let triggerDiv = document.createElement('div');
        triggerDiv.id = 'trigger-' + trig.id;
        triggerDiv.innerHTML = trig.id;
        triggerDiv.classList.add('trigger');
        triggerContainer.appendChild(triggerDiv);

        let triggerDetails = document.createElement('div');
        triggerDetails.classList.add('trigger-details');
        triggerContainer.appendChild(triggerDetails);

        triggerDetails.appendChild(this.buildTriggerOptions(trig));

        for (let detailKey in kDetailKeys) {
          if (!trig[detailKey])
            continue;
          let label = document.createElement('div');
          label.innerText = this.translate(kDetailKeys[detailKey].label);
          label.classList.add('trigger-label');
          triggerDetails.appendChild(label);

          let detail = document.createElement('div');
          detail.classList.add('trigger-detail');

          let output = trig.output[detailKey];
          detail.classList.add(kDetailKeys[detailKey].cls);
          if (trig.output[detailKey])
            detail.innerText = trig.output[detailKey];
          else if (typeof trig[detailKey] === 'function')
            detail.innerText = '(function)';
          else
            detail.innerText = trig[detailKey];

          triggerDetails.appendChild(detail);
        }
      }
    }
  }
}

UserConfig.getUserConfigLocation('config', function(e) {
  let configDataFiles;
  callOverlayHandler({
    call: 'cactbotReadDataFiles',
    source: location.href,
  }).then((e) => {
    configDataFiles = e.detail.files;
    let raidbossUrl = new URL('../raidboss/raidboss.html', location.href);
    return callOverlayHandler({
      call: 'cactbotReadDataFiles',
      source: raidbossUrl,
    });
  }).then((e) => {
    // TODO: maybe this could be decentralized to raidboss itself
    // and all this logic to handle raidboss files should not live
    // inside config?
    let raidbossDataFiles = e.detail.files;
    gConfig = new CactbotConfigurator(configDataFiles, raidbossDataFiles, Options);
  });
});
