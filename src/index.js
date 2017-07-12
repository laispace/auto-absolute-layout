import ReactDOM from 'react-dom';
import React, {PureComponent, PropTypes} from 'react';
import update from 'immutability-helper';
import {
    Tabs,
    Card,
    Collapse,
} from 'antd';
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

import 'antd/dist/antd.css';

class Box extends PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,
        index: PropTypes.number,
        onSizeChange: PropTypes.func,
        position: PropTypes.arrayOf(PropTypes.shape({
            top: PropTypes.number,
        }))
    };

    static defaultProps = {
        position: {
            position: 'relative',
            top: 0,
        }
    };
    state = {
        height: 0,
        width: 0,
    };

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

    componentWillUnmount() {
        window.removeEventListener('resize', this.try2HandleResize);
        if (this.observer && this.observer.disconnect) {
            this.observer.disconnect();
        }
    }
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
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#eee',
                        padding: '2px 4px',
                        color: 'green'
                    }}
                >top: {position.top}</div>
                {this.props.children}
            </div>
        );
    }
}

class App extends PureComponent {
    state = {
        boxSizeArr: [],
        boxPositionArr: [],
    };

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

    generateBox = (index, children) => {
        return (
            <Box
                index={index}
                onSizeChange={this.handleBoxSizeChange(index)}
                position={this.state.boxPositionArr[index]}
            >
                { children }
            </Box>
        );
    }
    render = () => {
        const {
            boxPositionArr
        } = this.state;
        return (
            <div>
                {
                    this.generateBox(0, <Tabs defaultActiveKey="1">
                        <TabPane tab="Tab 1" key="1">
                            <div
                                style={{
                                    height: 150,
                                    lineHeight: '150px',
                                    textAlign: 'center',
                                }}
                            >
                                我是高度 150 的 TabPane
                            </div>
                        </TabPane>
                        <TabPane tab="Tab 2" key="2">
                            <div
                                style={{
                                    height: 200,
                                    lineHeight: '200px',
                                    textAlign: 'center',
                                }}
                            >
                                我是高度 200 的 TabPane
                            </div>
                        </TabPane>
                        <TabPane tab="Tab 3" key="3">
                            <div
                                style={{
                                    height: 100,
                                    lineHeight: '100px',
                                    textAlign: 'center',
                                }}
                            >
                                我是高度 100 的 TabPane
                            </div>
                        </TabPane>
                    </Tabs>)
                }
                {
                    this.generateBox(1, <Card title="Card">
                        <p>我是固定高度的 Card 组件</p>
                        <p>我是固定高度的 Card 组件</p>
                        <p>我是固定高度的 Card 组件</p>
                    </Card>)
                }
                {
                    this.generateBox(2, <Tabs defaultActiveKey="1">
                        <TabPane tab="Tab 4" key="1">
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '0 10px',
                                }}
                            >
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="Tab 4.1" key="1">
                                        <div
                                            style={{
                                                height: 150,
                                                lineHeight: '150px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            我是嵌套的高度 150 的 TabPane
                                        </div>
                                    </TabPane>
                                    <TabPane tab="Tab 4.2" key="2">
                                        <div
                                            style={{
                                                height: 200,
                                                lineHeight: '200px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            我是嵌套的高度 200 的 TabPane
                                        </div>
                                    </TabPane>
                                    <TabPane tab="Tab 4.3" key="3">
                                        <div
                                            style={{
                                                height: 100,
                                                lineHeight: '100px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            我是嵌套的高度 100 的 TabPane
                                        </div>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </TabPane>
                        <TabPane tab="Tab 5" key="2">
                            <div
                                style={{
                                    height: 200,
                                    lineHeight: '200px',
                                    textAlign: 'center',
                                }}
                            >
                                我是高度 200 的 TabPane
                            </div>
                        </TabPane>
                        <TabPane tab="Tab 6" key="3">
                            <div
                                style={{
                                    height: 100,
                                    lineHeight: '100px',
                                    textAlign: 'center',
                                }}
                            >
                                我是高度 100 的 TabPane
                            </div>
                        </TabPane>
                    </Tabs>)
                }
                {
                    this.generateBox(3, <Card title="Card">
                        <p>我是固定高度的 Card 组件</p>
                        <p>我是固定高度的 Card 组件</p>
                        <p>我是固定高度的 Card 组件</p>
                    </Card>)
                }

            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('container')
);