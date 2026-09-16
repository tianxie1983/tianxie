// 本文件由 scripts/price-fetch.js 自动生成（复用 data/parts.js 与 utils/format.js）
window.PC = (function () {
  const categories = [
  {
    "key": "cpu",
    "name": "处理器",
    "icon": "🧠",
    "desc": "CPU 中央处理器"
  },
  {
    "key": "motherboard",
    "name": "主板",
    "icon": "🔲",
    "desc": "Motherboard 主机板"
  },
  {
    "key": "gpu",
    "name": "显卡",
    "icon": "🎮",
    "desc": "GPU 图形显卡"
  },
  {
    "key": "memory",
    "name": "内存",
    "icon": "📊",
    "desc": "Memory 运行内存"
  },
  {
    "key": "ssd",
    "name": "固态硬盘",
    "icon": "💾",
    "desc": "SSD 存储"
  },
  {
    "key": "cooler",
    "name": "散热器",
    "icon": "❄️",
    "desc": "CPU Cooler"
  },
  {
    "key": "psu",
    "name": "电源",
    "icon": "🔌",
    "desc": "Power Supply"
  },
  {
    "key": "chassis",
    "name": "机箱",
    "icon": "📦",
    "desc": "Computer Case"
  }
];
  const parts = [
  {
    "category": "cpu",
    "id": "cpu-i5-14600kf",
    "name": "Intel 酷睿 i5-14600KF",
    "brand": "Intel",
    "price": 2049,
    "power": 181,
    "socket": "LGA1700",
    "memType": "DDR5",
    "hot": true,
    "specs": [
      {
        "label": "核心/线程",
        "value": "14核20线程"
      },
      {
        "label": "加速频率",
        "value": "5.3GHz"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cpu",
    "id": "cpu-i7-14700kf",
    "name": "Intel 酷睿 i7-14700KF",
    "brand": "Intel",
    "price": 3499,
    "power": 253,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "20核28线程"
      },
      {
        "label": "加速频率",
        "value": "5.6GHz"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      3299,
      3499
    ]
  },
  {
    "category": "cpu",
    "id": "cpu-i9-14900kf",
    "name": "Intel 酷睿 i9-14900KF",
    "brand": "Intel",
    "price": 4999,
    "power": 253,
    "socket": "LGA1700",
    "memType": "DDR5",
    "hot": true,
    "specs": [
      {
        "label": "核心/线程",
        "value": "24核32线程"
      },
      {
        "label": "加速频率",
        "value": "6.0GHz"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      4999,
      4999
    ]
  },
  {
    "category": "cpu",
    "id": "cpu-r5-7500f",
    "name": "AMD 锐龙 R5 7500F",
    "brand": "AMD",
    "price": 1099,
    "power": 65,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "6核12线程"
      },
      {
        "label": "加速频率",
        "value": "5.0GHz"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cpu",
    "id": "cpu-r7-7800x3d",
    "name": "AMD 锐龙 R7 7800X3D",
    "brand": "AMD",
    "price": 3099,
    "power": 120,
    "socket": "AM5",
    "memType": "DDR5",
    "hot": true,
    "specs": [
      {
        "label": "核心/线程",
        "value": "8核16线程"
      },
      {
        "label": "加速频率",
        "value": "5.0GHz"
      },
      {
        "label": "3D缓存",
        "value": "96MB"
      },
      {
        "label": "插槽",
        "value": "AM5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      3099,
      3099
    ]
  },
  {
    "category": "cpu",
    "id": "cpu-r9-7950x",
    "name": "AMD 锐龙 R9 7950X",
    "brand": "AMD",
    "price": 5499,
    "power": 170,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "16核32线程"
      },
      {
        "label": "加速频率",
        "value": "5.7GHz"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      5499,
      5499
    ]
  },
  {
    "category": "cpu",
    "id": "cpu-i5-14400f",
    "name": "Intel 酷睿 i5-14400F",
    "brand": "Intel",
    "price": 999,
    "power": 65,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "10核16线程"
      },
      {
        "label": "加速频率",
        "value": "4.7GHz"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cpu",
    "id": "cpu-i5-13600kf",
    "name": "Intel 酷睿 i5-13600KF",
    "brand": "Intel",
    "price": 2599,
    "power": 181,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "14核20线程"
      },
      {
        "label": "加速频率",
        "value": "5.1GHz"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      2599,
      2599
    ]
  },
  {
    "category": "cpu",
    "id": "cpu-i5-14600k",
    "name": "Intel 酷睿 i5-14600K",
    "brand": "Intel",
    "price": 2199,
    "power": 181,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "14核20线程"
      },
      {
        "label": "加速频率",
        "value": "5.3GHz"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cpu",
    "id": "cpu-r5-7600",
    "name": "AMD 锐龙 R5 7600",
    "brand": "AMD",
    "price": 1399,
    "power": 65,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "6核12线程"
      },
      {
        "label": "加速频率",
        "value": "5.1GHz"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cpu",
    "id": "cpu-r5-7600x",
    "name": "AMD 锐龙 R5 7600X",
    "brand": "AMD",
    "price": 1499,
    "power": 105,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "6核12线程"
      },
      {
        "label": "加速频率",
        "value": "5.3GHz"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cpu",
    "id": "cpu-r7-7700",
    "name": "AMD 锐龙 R7 7700",
    "brand": "AMD",
    "price": 2099,
    "power": 65,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "8核16线程"
      },
      {
        "label": "加速频率",
        "value": "5.3GHz"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cpu",
    "id": "cpu-r7-9700x",
    "name": "AMD 锐龙 R7 9700X",
    "brand": "AMD",
    "price": 2849,
    "power": 65,
    "socket": "AM5",
    "memType": "DDR5",
    "hot": true,
    "specs": [
      {
        "label": "核心/线程",
        "value": "8核16线程"
      },
      {
        "label": "加速频率",
        "value": "5.5GHz"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      2849,
      2849
    ]
  },
  {
    "category": "cpu",
    "id": "cpu-r9-9900x",
    "name": "AMD 锐龙 R9 9900X",
    "brand": "AMD",
    "price": 4299,
    "power": 120,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "核心/线程",
        "value": "12核24线程"
      },
      {
        "label": "加速频率",
        "value": "5.6GHz"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存支持",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "motherboard",
    "id": "mb-b760m",
    "name": "微星 PRO B760M-A DDR5",
    "brand": "MSI",
    "price": 1049,
    "power": 35,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "Intel B760"
      },
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      659,
      1899
    ]
  },
  {
    "category": "motherboard",
    "id": "mb-z790a",
    "name": "华硕 ROG STRIX Z790-A",
    "brand": "ASUS",
    "price": 2899,
    "power": 45,
    "socket": "LGA1700",
    "memType": "DDR5",
    "hot": true,
    "specs": [
      {
        "label": "芯片组",
        "value": "Intel Z790"
      },
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      2899,
      2899
    ]
  },
  {
    "category": "motherboard",
    "id": "mb-b650m",
    "name": "技嘉 B650M 小雕",
    "brand": "Gigabyte",
    "price": 999,
    "power": 35,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "AMD B650"
      },
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      749,
      1099
    ]
  },
  {
    "category": "motherboard",
    "id": "mb-x670e",
    "name": "微星 MPG X670E",
    "brand": "MSI",
    "price": 2499,
    "power": 45,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "AMD X670E"
      },
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "motherboard",
    "id": "mb-h610m",
    "name": "微星 PRO H610M DDR5",
    "brand": "MSI",
    "price": 599,
    "power": 30,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "Intel H610"
      },
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      499,
      779
    ]
  },
  {
    "category": "motherboard",
    "id": "mb-b760m-tuf",
    "name": "华硕 TUF B760M",
    "brand": "ASUS",
    "price": 1049,
    "power": 35,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "Intel B760"
      },
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      659,
      1899
    ]
  },
  {
    "category": "motherboard",
    "id": "mb-z790-ud",
    "name": "技嘉 Z790 UD",
    "brand": "Gigabyte",
    "price": 2899,
    "power": 45,
    "socket": "LGA1700",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "Intel Z790"
      },
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "插槽",
        "value": "LGA1700"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      2899,
      2899
    ]
  },
  {
    "category": "motherboard",
    "id": "mb-b650-tuf",
    "name": "华硕 TUF GAMING B650",
    "brand": "ASUS",
    "price": 1299,
    "power": 35,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "AMD B650"
      },
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "motherboard",
    "id": "mb-b650m-mortar",
    "name": "微星 B650M 迫击炮",
    "brand": "MSI",
    "price": 999,
    "power": 35,
    "socket": "AM5",
    "memType": "DDR5",
    "hot": true,
    "specs": [
      {
        "label": "芯片组",
        "value": "AMD B650"
      },
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      749,
      1099
    ]
  },
  {
    "category": "motherboard",
    "id": "mb-x670e-flag",
    "name": "华硕 ROG X670E 旗舰",
    "brand": "ASUS",
    "price": 3299,
    "power": 45,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "AMD X670E"
      },
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "motherboard",
    "id": "mb-a620m",
    "name": "技嘉 A620M",
    "brand": "Gigabyte",
    "price": 799,
    "power": 30,
    "socket": "AM5",
    "memType": "DDR5",
    "specs": [
      {
        "label": "芯片组",
        "value": "AMD A620"
      },
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "插槽",
        "value": "AM5"
      },
      {
        "label": "内存",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-igpu",
    "name": "核显（使用处理器集成显卡）",
    "brand": "集成",
    "price": 0,
    "power": 0,
    "specs": [
      {
        "label": "类型",
        "value": "集成显卡"
      },
      {
        "label": "适用",
        "value": "办公/轻度娱乐"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-4060",
    "name": "影驰 RTX 4060 金属大师",
    "brand": "GALAX",
    "price": 2499,
    "power": 115,
    "hot": true,
    "specs": [
      {
        "label": "显存",
        "value": "8GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "115W"
      },
      {
        "label": "定位",
        "value": "1080P 游戏"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      2499,
      2499
    ]
  },
  {
    "category": "gpu",
    "id": "gpu-4070s",
    "name": "七彩虹 RTX 4070 SUPER",
    "brand": "Colorful",
    "price": 4799,
    "power": 220,
    "specs": [
      {
        "label": "显存",
        "value": "12GB GDDR6X"
      },
      {
        "label": "功耗",
        "value": "220W"
      },
      {
        "label": "定位",
        "value": "2K 游戏"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-4080s",
    "name": "微星 RTX 4080 SUPER",
    "brand": "MSI",
    "price": 8499,
    "power": 320,
    "hot": true,
    "specs": [
      {
        "label": "显存",
        "value": "16GB GDDR6X"
      },
      {
        "label": "功耗",
        "value": "320W"
      },
      {
        "label": "定位",
        "value": "4K 游戏"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-4090",
    "name": "华硕 RTX 4090 ROG",
    "brand": "ASUS",
    "price": 23999,
    "power": 450,
    "specs": [
      {
        "label": "显存",
        "value": "24GB GDDR6X"
      },
      {
        "label": "功耗",
        "value": "450W"
      },
      {
        "label": "定位",
        "value": "旗舰 4K/创作"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      22499,
      23999
    ]
  },
  {
    "category": "gpu",
    "id": "gpu-7800xt",
    "name": "蓝宝石 RX 7800 XT",
    "brand": "SAPPHIRE",
    "price": 3999,
    "power": 263,
    "specs": [
      {
        "label": "显存",
        "value": "16GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "263W"
      },
      {
        "label": "定位",
        "value": "2K 高刷"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-4060ti",
    "name": "影驰 RTX 4060 Ti 8G",
    "brand": "GALAX",
    "price": 2999,
    "power": 165,
    "hot": true,
    "specs": [
      {
        "label": "显存",
        "value": "8GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "165W"
      },
      {
        "label": "定位",
        "value": "1080P/2K"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-4070",
    "name": "七彩虹 RTX 4070",
    "brand": "Colorful",
    "price": 4299,
    "power": 200,
    "specs": [
      {
        "label": "显存",
        "value": "12GB GDDR6X"
      },
      {
        "label": "功耗",
        "value": "200W"
      },
      {
        "label": "定位",
        "value": "2K 游戏"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-4070tis",
    "name": "微星 RTX 4070 Ti SUPER",
    "brand": "MSI",
    "price": 6499,
    "power": 285,
    "specs": [
      {
        "label": "显存",
        "value": "16GB GDDR6X"
      },
      {
        "label": "功耗",
        "value": "285W"
      },
      {
        "label": "定位",
        "value": "2K/4K"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-4080",
    "name": "影驰 RTX 4080",
    "brand": "GALAX",
    "price": 9499,
    "power": 320,
    "specs": [
      {
        "label": "显存",
        "value": "16GB GDDR6X"
      },
      {
        "label": "功耗",
        "value": "320W"
      },
      {
        "label": "定位",
        "value": "4K 游戏"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-rx7600",
    "name": "蓝宝石 RX 7600",
    "brand": "SAPPHIRE",
    "price": 2099,
    "power": 165,
    "specs": [
      {
        "label": "显存",
        "value": "8GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "165W"
      },
      {
        "label": "定位",
        "value": "1080P"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-rx7700xt",
    "name": "撼讯 RX 7700 XT",
    "brand": "PowerColor",
    "price": 3499,
    "power": 245,
    "specs": [
      {
        "label": "显存",
        "value": "12GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "245W"
      },
      {
        "label": "定位",
        "value": "2K 高刷"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-rx7900xt",
    "name": "蓝宝石 RX 7900 XT",
    "brand": "SAPPHIRE",
    "price": 5999,
    "power": 315,
    "specs": [
      {
        "label": "显存",
        "value": "20GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "315W"
      },
      {
        "label": "定位",
        "value": "4K 游戏"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-rx7900xtx",
    "name": "蓝宝石 RX 7900 XTX",
    "brand": "SAPPHIRE",
    "price": 7999,
    "power": 355,
    "specs": [
      {
        "label": "显存",
        "value": "24GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "355W"
      },
      {
        "label": "定位",
        "value": "旗舰 4K"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-arc770",
    "name": "英特尔 Arc A770 16G",
    "brand": "Intel",
    "price": 2499,
    "power": 225,
    "specs": [
      {
        "label": "显存",
        "value": "16GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "225W"
      },
      {
        "label": "定位",
        "value": "创作/剪辑"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "gpu",
    "id": "gpu-rx9070xt",
    "name": "撼讯 RX 9070 XT",
    "brand": "PowerColor",
    "price": 5399,
    "power": 304,
    "hot": true,
    "specs": [
      {
        "label": "显存",
        "value": "16GB GDDR6"
      },
      {
        "label": "功耗",
        "value": "304W"
      },
      {
        "label": "定位",
        "value": "2K/4K"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      5399,
      5399
    ]
  },
  {
    "category": "memory",
    "id": "mem-16g-6000",
    "name": "金士顿 FURY 16G DDR5 6000",
    "brand": "Kingston",
    "price": 479,
    "power": 8,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "16GB (8G×2)"
      },
      {
        "label": "频率",
        "value": "6000MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      479,
      479
    ]
  },
  {
    "category": "memory",
    "id": "mem-32g-6000",
    "name": "芝奇 焰光戟 32G DDR5 6000",
    "brand": "G.SKILL",
    "price": 699,
    "power": 10,
    "memType": "DDR5",
    "hot": true,
    "specs": [
      {
        "label": "容量",
        "value": "32GB (16G×2)"
      },
      {
        "label": "频率",
        "value": "6000MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "memory",
    "id": "mem-32g-6400",
    "name": "英睿达 32G DDR5 6400",
    "brand": "Crucial",
    "price": 799,
    "power": 10,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "32GB (16G×2)"
      },
      {
        "label": "频率",
        "value": "6400MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      799,
      799
    ]
  },
  {
    "category": "memory",
    "id": "mem-16g-6800",
    "name": "金百达 16G DDR5 6800",
    "brand": "KINGBANK",
    "price": 329,
    "power": 8,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "16GB (8G×2)"
      },
      {
        "label": "频率",
        "value": "6800MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "memory",
    "id": "mem-32g-6000k",
    "name": "金士顿 FURY 32G DDR5 6000",
    "brand": "Kingston",
    "price": 699,
    "power": 10,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "32GB (16G×2)"
      },
      {
        "label": "频率",
        "value": "6000MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "memory",
    "id": "mem-16g-6000g",
    "name": "芝奇 焰光戟 16G DDR5 6000",
    "brand": "G.SKILL",
    "price": 479,
    "power": 8,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "16GB (8G×2)"
      },
      {
        "label": "频率",
        "value": "6000MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      479,
      479
    ]
  },
  {
    "category": "memory",
    "id": "mem-16g-5600c",
    "name": "英睿达 16G DDR5 5600",
    "brand": "Crucial",
    "price": 299,
    "power": 8,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "16GB (8G×2)"
      },
      {
        "label": "频率",
        "value": "5600MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "memory",
    "id": "mem-32g-6400g",
    "name": "光威 32G DDR5 6400",
    "brand": "Gloway",
    "price": 799,
    "power": 10,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "32GB (16G×2)"
      },
      {
        "label": "频率",
        "value": "6400MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      799,
      799
    ]
  },
  {
    "category": "memory",
    "id": "mem-32g-6800a",
    "name": "阿斯加特 32G DDR5 6800",
    "brand": "Asgard",
    "price": 659,
    "power": 10,
    "memType": "DDR5",
    "specs": [
      {
        "label": "容量",
        "value": "32GB (16G×2)"
      },
      {
        "label": "频率",
        "value": "6800MHz"
      },
      {
        "label": "类型",
        "value": "DDR5"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-1t-tiplus",
    "name": "致态 TiPlus7100 1TB",
    "brand": "ZhiTai",
    "price": 459,
    "power": 7,
    "hot": true,
    "specs": [
      {
        "label": "容量",
        "value": "1TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "7100MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-1t-980pro",
    "name": "三星 980 PRO 1TB",
    "brand": "SAMSUNG",
    "price": 699,
    "power": 8,
    "specs": [
      {
        "label": "容量",
        "value": "1TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "7000MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-2t-sn850x",
    "name": "西数 SN850X 2TB",
    "brand": "WD",
    "price": 1099,
    "power": 9,
    "specs": [
      {
        "label": "容量",
        "value": "2TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "7300MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-2t-ti600",
    "name": "致态 Ti600 2TB",
    "brand": "ZhiTai",
    "price": 799,
    "power": 8,
    "specs": [
      {
        "label": "容量",
        "value": "2TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "7000MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-1t-se10",
    "name": "铠侠 SE10 1TB",
    "brand": "Kioxia",
    "price": 549,
    "power": 8,
    "specs": [
      {
        "label": "容量",
        "value": "1TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "7300MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-1t-ti5000",
    "name": "致态 TiPlus5000 1TB",
    "brand": "ZhiTai",
    "price": 369,
    "power": 6,
    "specs": [
      {
        "label": "容量",
        "value": "1TB"
      },
      {
        "label": "接口",
        "value": "PCIe 3.0 NVMe"
      },
      {
        "label": "读取",
        "value": "3500MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-2t-990pro",
    "name": "三星 990 PRO 2TB",
    "brand": "SAMSUNG",
    "price": 1299,
    "power": 9,
    "hot": true,
    "specs": [
      {
        "label": "容量",
        "value": "2TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "7450MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-1t-p3plus",
    "name": "英睿达 P3 Plus 1TB",
    "brand": "Crucial",
    "price": 399,
    "power": 6,
    "specs": [
      {
        "label": "容量",
        "value": "1TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "5000MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "ssd",
    "id": "ssd-1t-sn770",
    "name": "西数 SN770 1TB",
    "brand": "WD",
    "price": 469,
    "power": 7,
    "specs": [
      {
        "label": "容量",
        "value": "1TB"
      },
      {
        "label": "接口",
        "value": "PCIe 4.0 NVMe"
      },
      {
        "label": "读取",
        "value": "5150MB/s"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-ax120",
    "name": "利民 AX120 R SE 风冷",
    "brand": "Thermalright",
    "price": 89,
    "power": 3,
    "specs": [
      {
        "label": "类型",
        "value": "单塔风冷"
      },
      {
        "label": "高度",
        "value": "155mm"
      },
      {
        "label": "适用",
        "value": "≤150W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-ak620",
    "name": "九州风神 AK620 双塔",
    "brand": "DEEPCOOL",
    "price": 239,
    "power": 5,
    "hot": true,
    "specs": [
      {
        "label": "类型",
        "value": "双塔风冷"
      },
      {
        "label": "高度",
        "value": "160mm"
      },
      {
        "label": "适用",
        "value": "≤260W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-frozen360",
    "name": "利民 Frozen 360 水冷",
    "brand": "Thermalright",
    "price": 499,
    "power": 7,
    "specs": [
      {
        "label": "类型",
        "value": "360 一体水冷"
      },
      {
        "label": "适用",
        "value": "≤300W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-kraken360",
    "name": "恩杰 Kraken 360 水冷",
    "brand": "NZXT",
    "price": 999,
    "power": 8,
    "specs": [
      {
        "label": "类型",
        "value": "360 一体水冷"
      },
      {
        "label": "屏幕",
        "value": "2.36\" LCD"
      },
      {
        "label": "适用",
        "value": "≤300W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-pa120",
    "name": "利民 PA120 双塔",
    "brand": "Thermalright",
    "price": 139,
    "power": 4,
    "specs": [
      {
        "label": "类型",
        "value": "双塔风冷"
      },
      {
        "label": "高度",
        "value": "155mm"
      },
      {
        "label": "适用",
        "value": "≤220W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-ag400",
    "name": "九州风神 AG400",
    "brand": "DEEPCOOL",
    "price": 89,
    "power": 3,
    "specs": [
      {
        "label": "类型",
        "value": "单塔风冷"
      },
      {
        "label": "高度",
        "value": "150mm"
      },
      {
        "label": "适用",
        "value": "≤220W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-r4000",
    "name": "超频三 东海 R4000",
    "brand": "PCCOOLER",
    "price": 119,
    "power": 4,
    "specs": [
      {
        "label": "类型",
        "value": "四热管风冷"
      },
      {
        "label": "高度",
        "value": "155mm"
      },
      {
        "label": "适用",
        "value": "≤200W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-kraken240",
    "name": "恩杰 Kraken 240 水冷",
    "brand": "NZXT",
    "price": 699,
    "power": 6,
    "specs": [
      {
        "label": "类型",
        "value": "240 一体水冷"
      },
      {
        "label": "适用",
        "value": "≤250W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-mag360",
    "name": "微星 MAG 360 水冷",
    "brand": "MSI",
    "price": 599,
    "power": 7,
    "hot": true,
    "specs": [
      {
        "label": "类型",
        "value": "360 一体水冷"
      },
      {
        "label": "适用",
        "value": "≤300W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "cooler",
    "id": "cooler-cr1000",
    "name": "乔思伯 CR-1000 风冷",
    "brand": "JONSBO",
    "price": 69,
    "power": 3,
    "specs": [
      {
        "label": "类型",
        "value": "单塔风冷"
      },
      {
        "label": "高度",
        "value": "158mm"
      },
      {
        "label": "适用",
        "value": "≤150W"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "psu",
    "id": "psu-650",
    "name": "长城 650W 金牌",
    "brand": "GreatWall",
    "price": 520,
    "power": 0,
    "watt": 650,
    "specs": [
      {
        "label": "额定",
        "value": "650W"
      },
      {
        "label": "认证",
        "value": "80PLUS 金牌"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      520,
      520
    ]
  },
  {
    "category": "psu",
    "id": "psu-750",
    "name": "酷冷至尊 750W 金牌",
    "brand": "CoolerMaster",
    "price": 699,
    "power": 0,
    "watt": 750,
    "specs": [
      {
        "label": "额定",
        "value": "750W"
      },
      {
        "label": "认证",
        "value": "80PLUS 金牌"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      440,
      699
    ]
  },
  {
    "category": "psu",
    "id": "psu-850",
    "name": "振华 LEADEX 850W 金牌",
    "brand": "SuperFlower",
    "price": 1079,
    "power": 0,
    "watt": 850,
    "hot": true,
    "specs": [
      {
        "label": "额定",
        "value": "850W"
      },
      {
        "label": "认证",
        "value": "80PLUS 金牌"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      599,
      1079
    ]
  },
  {
    "category": "psu",
    "id": "psu-1000",
    "name": "海韵 FOCUS 1000W 白金",
    "brand": "Seasonic",
    "price": 899,
    "power": 0,
    "watt": 1000,
    "specs": [
      {
        "label": "额定",
        "value": "1000W"
      },
      {
        "label": "认证",
        "value": "80PLUS 白金"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      794,
      899
    ]
  },
  {
    "category": "psu",
    "id": "psu-550",
    "name": "振华 550W 铜牌",
    "brand": "SuperFlower",
    "price": 299,
    "power": 0,
    "watt": 550,
    "specs": [
      {
        "label": "额定",
        "value": "550W"
      },
      {
        "label": "认证",
        "value": "80PLUS 铜牌"
      },
      {
        "label": "模组",
        "value": "非模组"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "psu",
    "id": "psu-750a",
    "name": "安钛克 750W 金牌",
    "brand": "Antec",
    "price": 699,
    "power": 0,
    "watt": 750,
    "specs": [
      {
        "label": "额定",
        "value": "750W"
      },
      {
        "label": "认证",
        "value": "80PLUS 金牌"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      440,
      699
    ]
  },
  {
    "category": "psu",
    "id": "psu-850rm",
    "name": "海盗船 RM850e 金牌",
    "brand": "Corsair",
    "price": 699,
    "power": 0,
    "watt": 850,
    "hot": true,
    "specs": [
      {
        "label": "额定",
        "value": "850W"
      },
      {
        "label": "认证",
        "value": "80PLUS 金牌"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "psu",
    "id": "psu-1000a",
    "name": "微星 A1000G 金牌",
    "brand": "MSI",
    "price": 1099,
    "power": 0,
    "watt": 1000,
    "specs": [
      {
        "label": "额定",
        "value": "1000W"
      },
      {
        "label": "认证",
        "value": "80PLUS 金牌"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "psu",
    "id": "psu-1200",
    "name": "全汉 1200W 白金",
    "brand": "FSP",
    "price": 1499,
    "power": 0,
    "watt": 1200,
    "specs": [
      {
        "label": "额定",
        "value": "1200W"
      },
      {
        "label": "认证",
        "value": "80PLUS 白金"
      },
      {
        "label": "模组",
        "value": "全模组"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-m2",
    "name": "先马 平头哥 M2",
    "brand": "SAMA",
    "price": 159,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "材质",
        "value": "钢化玻璃侧透"
      },
      {
        "label": "风冷限高",
        "value": "165mm"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      129,
      169
    ]
  },
  {
    "category": "chassis",
    "id": "chassis-d31",
    "name": "乔思伯 D31 网孔版",
    "brand": "JONSBO",
    "price": 399,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "屏幕位",
        "value": "可选副屏"
      },
      {
        "label": "风冷限高",
        "value": "168mm"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-623",
    "name": "追风者 623",
    "brand": "Phanteks",
    "price": 499,
    "power": 5,
    "hot": true,
    "specs": [
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "材质",
        "value": "钢化玻璃侧透"
      },
      {
        "label": "水冷支持",
        "value": "360 冷排"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-o11",
    "name": "联力 包豪斯 O11",
    "brand": "LianLi",
    "price": 699,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "材质",
        "value": "双面钢化玻璃"
      },
      {
        "label": "水冷支持",
        "value": "360 冷排"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-luban1",
    "name": "先马 鲁班1",
    "brand": "SAMA",
    "price": 299,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "材质",
        "value": "钢化玻璃侧透"
      },
      {
        "label": "水冷支持",
        "value": "360 冷排"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-yogo",
    "name": "爱国者 YOGO M2",
    "brand": "aigo",
    "price": 159,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "材质",
        "value": "网孔面板"
      },
      {
        "label": "风冷限高",
        "value": "168mm"
      }
    ],
    "priceSource": "zol",
    "priceRange": [
      129,
      169
    ]
  },
  {
    "category": "chassis",
    "id": "chassis-nr400",
    "name": "酷冷 NR400",
    "brand": "CoolerMaster",
    "price": 329,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "M-ATX"
      },
      {
        "label": "材质",
        "value": "侧透"
      },
      {
        "label": "风冷限高",
        "value": "167mm"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-207",
    "name": "联力 鬼斧207",
    "brand": "LianLi",
    "price": 499,
    "power": 5,
    "hot": true,
    "specs": [
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "材质",
        "value": "双仓设计"
      },
      {
        "label": "水冷支持",
        "value": "360 冷排"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-p20c",
    "name": "安钛克 P20C",
    "brand": "Antec",
    "price": 399,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "材质",
        "value": "网孔面板"
      },
      {
        "label": "水冷支持",
        "value": "360 冷排"
      }
    ],
    "priceSource": "manual"
  },
  {
    "category": "chassis",
    "id": "chassis-xt523",
    "name": "追风者 XT523",
    "brand": "Phanteks",
    "price": 459,
    "power": 5,
    "specs": [
      {
        "label": "板型",
        "value": "ATX"
      },
      {
        "label": "材质",
        "value": "钢化玻璃侧透"
      },
      {
        "label": "水冷支持",
        "value": "360 冷排"
      }
    ],
    "priceSource": "manual"
  }
];
  const presets = [
  {
    "id": "p-budget",
    "name": "办公入门",
    "desc": "核显办公，性价比之选",
    "cpu": "cpu-r5-7500f",
    "motherboard": "mb-b650m",
    "gpu": "gpu-igpu",
    "memory": "mem-16g-6000",
    "ssd": "ssd-1t-tiplus",
    "cooler": "cooler-ax120",
    "psu": "psu-650",
    "chassis": "chassis-m2"
  },
  {
    "id": "p-game",
    "name": "2K 游戏",
    "desc": "高帧率 2K 游戏主机",
    "cpu": "cpu-r7-7800x3d",
    "motherboard": "mb-b650m",
    "gpu": "gpu-4070s",
    "memory": "mem-32g-6000",
    "ssd": "ssd-2t-ti600",
    "cooler": "cooler-ak620",
    "psu": "psu-850",
    "chassis": "chassis-623"
  },
  {
    "id": "p-flag",
    "name": "旗舰 4K",
    "desc": "顶级 4K 发烧配置",
    "cpu": "cpu-i9-14900kf",
    "motherboard": "mb-z790a",
    "gpu": "gpu-4090",
    "memory": "mem-32g-6400",
    "ssd": "ssd-2t-sn850x",
    "cooler": "cooler-frozen360",
    "psu": "psu-1000",
    "chassis": "chassis-o11"
  }
];
  const meta = {
  "updatedAt": "2026-09-16T11:55:05.453Z",
  "source": "中关村在线(ZOL)公开参考价",
  "autoCount": 27,
  "manualCount": 61,
  "total": 88,
  "note": "价格随行情波动，仅供参考；未匹配到公开报价的配件保留原价。"
};

  function categoryOf(key) { return categories.find(c => c.key === key); }
  function partsOfCategory(key) { return parts.filter(p => p.category === key); }
  function partById(id) { return parts.find(p => p.id === id); }

  function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-US');
}
  function roundWatt(w) {
  return Math.ceil(w / 50) * 50;
}
  function evaluateBuild(selection) {
  const items = {};
  let total = 0;
  let totalPower = 0;

  categories.forEach(cat => {
    const id = selection[cat.key];
    if (id) {
      const part = partById(id);
      if (part) {
        items[cat.key] = part;
        total += part.price || 0;
        totalPower += part.power || 0;
      }
    }
  });

  // 基础功耗：风扇/外设/余量
  totalPower += 30;

  const recommendedPsu = roundWatt(totalPower * 1.3);

  const issues = [];
  const cpu = items.cpu;
  const mb = items.motherboard;
  const mem = items.memory;
  const psu = items.psu;

  if (cpu && mb && cpu.socket && mb.socket && cpu.socket !== mb.socket) {
    issues.push({ level: 'bad', text: `处理器（${cpu.socket}）与主板（${mb.socket}）插槽不匹配` });
  }
  if (mb && mem && mb.memType && mem.memType && mb.memType !== mem.memType) {
    issues.push({ level: 'bad', text: `主板（${mb.memType}）与内存（${mem.memType}）类型不匹配` });
  }
  if (psu && psu.watt) {
    if (psu.watt < totalPower * 1.15) {
      issues.push({ level: 'bad', text: `电源 ${psu.watt}W 不足，建议 ≥ ${recommendedPsu}W（估算功耗 ${totalPower}W）` });
    } else if (psu.watt < recommendedPsu) {
      issues.push({ level: 'warn', text: `电源余量偏小，建议 ≥ ${recommendedPsu}W（估算功耗 ${totalPower}W）` });
    } else {
      issues.push({ level: 'ok', text: `电源 ${psu.watt}W 满足需求（估算功耗 ${totalPower}W）` });
    }
  }

  const complete = categories.every(cat => items[cat.key]);

  return { items, total, totalPower, recommendedPsu, complete, issues };
}

  return { categories, parts, presets, meta, categoryOf, partsOfCategory, partById, formatMoney, roundWatt, evaluateBuild };
})();
