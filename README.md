# 一种绝对布局下组件高度(宽度)自适应的简单实现

常见的网页布局是使用流式布局，假定从往下排列组件，当其中一个组件(如 Tabs ) 高度突变后，余下的组件会顺延展开，是不会出现重叠的情况的。

结构类似这样:

```
<Container>
    <Tabs />
    <Card />
</Container>
```

使用流式布局时，`Tabs` 和 `Card` 依次从上往下排布时，若 `Tabs` 的高度突变时(切换到了另一个高度不等的 Tab 中)，`Card` 的位置会顺延。

但在一些场景下可能会考虑使用绝对布局，如支持拖拽任意组件进行组合形成网页，结构类似这样：

```
<Container style={{position: 'relative'}}>
    <Tabs  style={{position: 'absolute', top: '100px'}} />
    <Card  style={{position: 'absolute', top: '200px'}} />
</Container>
```


使用绝对布局时，容器内 `Tabs` 和 `Card` 组件都为相对容器进行布局定位，`Tabs` 高度突变时(切换到了另一个高度不等的 Tab 中)，`Card` 的位置仍为绝对定位，可能会和 `Tabs` 产生重叠。

那问题来了，怎么解决这种容器内，所有组件为绝对布局时的高度自适应？

解决办法是，容器监听容器内部所有绝对布局组件，任何容器内组件高度变更时，重新计算所有组件的新坐标进行定位。

这里使用 `MutationObserver` 这个有趣的接口就可以实现。

先简单介绍下 `MutationObserver`，它是用于替换 `Mutation events` 的一个新接口，可监听 DOM 元素的属性变更。

以前我们可能需要让组件内部自计算高度，抛给外层容器，而这个 `MutationObserver` 关注的是一个 DOM 节点最终的属性变化，可直接反应变更结果，更为便捷。

## 来看个简单的例子

在 `Container` 容器下新建 `Box` 作为子容器，将需要做绝对定位的组件进行包裹：
```
<Container>
    <Box>
        <Tabs />
    </Box>
    <Box
        <Tabs />
    </Box>
<Container />
```

在 `Box` 中监听自身 DOM 属性 `attributes.style` 的变更(`height` 包含在 `style` 中)，检测到 `Box` 前后高度变更(包括 `ComponentDidMount` 和 `window.resize` 阶段)时，通知 `Container` 重新计算所有 `Box` 的坐标以重新布局：
```
// Box
componentDidMount() {
    window.addEventListener('resize', this.try2HandleResize);
    if (MutationObserver) {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(item => {
                if (item.type === 'attributes' && item.attributeName === 'style') {
                    this.try2HandleResize();
                }
            });
        });
        this.observer.observe(this.node, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
            attributeFilter : ['style']
        });
    } else {
        // todo try some polyfill
    }
    this.try2HandleResize();
}
```

`Box` 的 `attributes.style` 变更后，重新计算自身的高度：
```
// Box
try2HandleResize () {
        if (this.node) {
            const boundingClientRect = this.node.getBoundingClientRect();
            const width = boundingClientRect.width;
            const height = boundingClientRect.height;
            if (width !== this.state.width || height !== this.state.height) {
                this.setState({
                    width,
                    height,
                }, () => {
                    if (this.props.onSizeChange) {
                        this.props.onSizeChange({
                            width,
                            height,
                        });
                    }
                });
            }
        }
    }
```

通知外层 `Container` 容器，重新计算绝对定位的坐标，布局容器内的 `Box`：
```
// Container
handleBoxSizeChange = (index) => {
        return (size) => {
            this.setState(state =>{
                const boxSizeArr = update(state.boxSizeArr, {
                    $splice: [[index, 1, size]],
                });
                const boxPositionArr = update(state.boxPositionArr, {
                    $apply: () => {
                        let deltaHeight;
                        const boxPositionArr = [];
                        boxSizeArr.forEach((item, index) => {
                            if(index === 0) {
                                deltaHeight = 0;
                            } else {
                                deltaHeight += boxSizeArr[index -1].height;
                            }
                            boxPositionArr[index] = {
                                // left: 0, // todo support horizontal auto layout
                                position: 'absolute',
                                top: deltaHeight,
                            }
                        });
                        return boxPositionArr;
                    }
                });
                return update(state, {
                    boxSizeArr: {
                        $set: boxSizeArr,
                    },
                    boxPositionArr: {
                        $set: boxPositionArr,
                    },
                });
            })
        };
    };
```

`Container` 重新传递定位坐标 `position` 给到具体的 `Box`:
```
// Box
render = () => {
    const {
        position
    } = this.props;
    return (
        <div
            style={{
                width: '100%',
                position: position.position,
                top: position.top,
            }}
            ref={node => {
                this.node = node;
            }}
        >
            {this.props.children}
        </div>
    );
}
```

时序图：

![demo.png](assets/demo.png?raw=true)

效果图：

![demo.png](assets/demo.gif?raw=true)


这是一个简单的绝对布局高度自适应的简单例子，宽度自适应也类似。

## 参考资料
- [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [Can I use MutationObserver](http://caniuse.com/#search=MutationObserver)


