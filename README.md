# auto-absolute-layout

使用绝对布局，组件高度图表后，重新计算每个组件的定位进行布局

使用流式布局时，A-B-C 组件按此从上往下排布时，若 B 的高度突变，C 的位置会顺延。

使用绝对布局时，容器内 A/B/C 组件都为相对容器进行布局定位，B 高度突变时，C 若不感知 B 突变，那将造成 B 和 C 组件重叠(如 B 为 Tabs 组件时)。

解决办法是，容器监听容器内部所有绝对布局组件，任何容器内组件高度变更时，重新计算所有组件的新坐标进行定位。


```
// example
$ npm i
$ npm start
$ open http://localhost:8082/
```

![demo.png](assets/demo.gif?raw=true)


