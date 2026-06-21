window.graphData = {
  "nodes": [
    {
      "id": "0",
      "label": "Alpha",
      "group": "Region-A",
      "subgroup": "High-Priority",
      "shape": "circularImage",
      "value": 64,
      "image": "assets/Alpha.png",
      "brokenImage": "assets/default_node.png",
      "color": {
        "background": "hsl(32, 72.54171562656066%, 69.5759379550874%)",
        "border": "hsl(32, 72.54171562656066%, 69.5759379550874%)"
      },
      "font": {
        "color": "#000",
        "size": 16
      }
    },
    {
      "id": "1",
      "label": "Beta",
      "group": "Region-A",
      "subgroup": "Standard",
      "shape": "circularImage",
      "value": 100,
      "image": "assets/Beta.png",
      "brokenImage": "assets/default_node.png",
      "color": {
        "background": "hsl(32, 72.54171562656066%, 69.5759379550874%)",
        "border": "hsl(32, 72.54171562656066%, 69.5759379550874%)"
      },
      "font": {
        "color": "#000",
        "size": 16
      }
    },
    {
      "id": "2",
      "label": "Gamma",
      "group": "Region-B",
      "subgroup": "Standard",
      "shape": "circularImage",
      "value": 100,
      "image": "assets/Gamma.png",
      "brokenImage": "assets/default_node.png",
      "color": {
        "background": "hsl(281, 71.67506455551789%, 62.34698179920225%)",
        "border": "hsl(281, 71.67506455551789%, 62.34698179920225%)"
      },
      "font": {
        "color": "#000",
        "size": 16
      }
    },
    {
      "id": "3",
      "label": "Delta",
      "group": "Region-C",
      "subgroup": "High-Priority",
      "shape": "circularImage",
      "value": 36,
      "image": "assets/Delta.png",
      "brokenImage": "assets/default_node.png",
      "color": {
        "background": "hsl(179, 88.36467605937351%, 72.75781224511141%)",
        "border": "hsl(179, 88.36467605937351%, 72.75781224511141%)"
      },
      "font": {
        "color": "#000",
        "size": 16
      }
    },
    {
      "id": "4",
      "label": "Epsilon",
      "group": "Region-D",
      "subgroup": "Low- Priority",
      "shape": "circularImage",
      "value": 36,
      "image": "assets/Epsilon.png",
      "brokenImage": "assets/default_node.png",
      "color": {
        "background": "hsl(221, 84.01794447390586%, 67.84387740325423%)",
        "border": "hsl(221, 84.01794447390586%, 67.84387740325423%)"
      },
      "font": {
        "color": "#000",
        "size": 16
      }
    }
  ],
  "edges": [
    {
      "from": "0",
      "to": "1",
      "label": "Direct Link",
      "color": "#ea9999",
      "width": 1
    },
    {
      "from": "0",
      "to": "2",
      "label": "Direct Link",
      "color": "#ea9999",
      "width": 2
    },
    {
      "from": "1",
      "to": "2",
      "label": "Direct Link",
      "color": "#ea9999",
      "width": 1
    },
    {
      "from": "1",
      "to": "4",
      "label": "Direct Link",
      "color": "#ea9999",
      "width": 2
    },
    {
      "from": "2",
      "to": "3",
      "label": "Secondary Link",
      "color": "#d5a6bd",
      "width": 2
    }
  ]
};