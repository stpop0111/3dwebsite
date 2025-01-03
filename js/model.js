// models.js
export const MODEL_DATA = {
    vendingMachine: {
        id: 'vendingMachine',
        path: '../models/model01_vendingMachine.glb',
        title: '自動販売機',
        description: 'どこにでもある普通の自動販売機',
        displayName: '自販機',
        animation:{
            hasAnimation: false
        }
    },
    flyer: {
        id: 'flyer',
        path: '../models/model02_flyer.glb',
        title: 'フライヤー',
        description: '揚げ物っておいしいよね',
        displayName: 'フライヤー',
        animation:{
            hasAnimation: false
        }
    },
    casher: {
        id: 'casher',
        path: '../models/model03_casher.glb',
        title: 'レジ',
        description: 'コンビニでよく見かけるレジ',
        displayName: 'レジ',
        animation:{
            hasAnimation: false
        }
    },
    telePhone: {
        id: 'telePhone',
        path: '../models/model04_telePhone.glb',
        title: '公衆電話',
        description: '最近は見かけなくなった公衆電話',
        displayName: '公衆電話',
        animation:{
            hasAnimation: false
        }
    },
    hotWaterHeater: {
        id: 'hotWaterHeater',
        path: '../models/model05_hotWaterHeater.glb',
        title: '給湯器',
        description: 'お店でよく見かける給湯器',
        displayName: '給湯器',
        animation:{
            hasAnimation: false
        }
    },
    microWave: {
        id: 'microWave',
        path: '../models/model06_microWave.glb',
        title: '電子レンジ',
        description: 'コンビニでおなじみの電子レンジ',
        displayName: '電子レンジ',
        animation:{
            hasAnimation: false
        }
    },
    atm: {
        id: 'atm',
        path: '../models/model07_atm.glb',
        title: 'ATM',
        description: 'お金をおろせるATM',
        displayName: 'ATM',
        animation:{
            hasAnimation: false,
        }
    },
    monkeyToy:{
    id: 'monkeyToy',
    path: '../models/monkeyToy.glb',
    title: 'サルのおもちゃ',
    description: 'きゅうたが大好きなサルのおもちゃ',
    displayName: 'サルのおもちゃ',
    animation:{
        hasAnimation: true,
        clips:[
            {
                name: 'windingAction',
                displayName: 'ネジをまく'
            },
            {
                name: 'cymbalClap',
                displayName: 'シンバルをたたく'
            }
        ],
        currentClip: 0,
        duration: .3,
        loop: true,
        }
    }
}