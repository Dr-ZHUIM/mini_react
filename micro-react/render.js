function render(element, container) {
    //创建元素
    const dom = element.type === 'TEXT_ELEMENT' 
    ? document.createTextNode('') 
    : document.createElement(element.type);
    //设置属性
    Object.keys(element.props).filter(key => key !== 'children')
    .map(key=>(dom[key] = element.props[key]))
    //递归渲染子元素
    element.props.children.map(child=>{
        render(child,dom);
    });
    //追加至父元素
    container.append(dom);
}

export default render