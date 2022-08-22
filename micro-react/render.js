function render(element, container) {
    //创建元素
    const dom = element.type === 'TEXT_ELEMENT' 
    ? document.createTextNode('') 
    : document.createElement(element.type);
    //设置属性
    Object.keys(element.props).filter(key => key !== 'children')
    .map(key=>(dom[key] = element.props[key]))
    //追加至父元素
    container.append(dom);
}

let nextUnitOfWork = null;

function workLoop(){
    //应该退出
    let shouldYield = false;
    //有工作且有时间运行时
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        //判断时间是否足够
        shouldYield = deadLine.timeRemaining() < 1;
    };
    //没有时间就再次请求
    requestIdleCallback(workLoop);
};

requestIdleCallback(workLoop)

function performUnitOfWork(work){
    
}

export default render