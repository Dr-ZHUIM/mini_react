// function render(element, container) {
//     //创建元素
//     const dom = element.type === 'TEXT_ELEMENT' 
//     ? document.createTextNode('') 
//     : document.createElement(element.type);
//     //设置属性
//     Object.keys(element.props).filter(key => key !== 'children')
//     .map(key=>(dom[key] = element.props[key]))
//     //追加至父元素
//     container.append(dom);
// }

function createDOM(fiber) {
    //创建元素
    const dom = fiber.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(fiber.type);
    //设置属性
    Object.keys(fiber.props).filter(key => key !== 'children')
        .map(key => (dom[key] = fiber.props[key]))
    //追加至父元素
    return dom
}

//render函数转接处理第一次任务
function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        sibling: null,
        child: null,
        parent: null
    };
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null

function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) return;
    const domParent = fiber.parent.dom;
    domParent.append(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function workLoop(deadLine) {
    //应该退出
    let shouldYield = false;
    //有工作且有时间运行时
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        //判断时间是否足够
        shouldYield = deadLine.timeRemaining() < 1;
    };
    //没有时间就再次请求
    requestIdleCallback(workLoop);
    //commit阶段
    if (!nextUnitOfWork && wipRoot) commitRoot()
};

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    /**
     * 1. 添加dom节点
     * 2. 创建新的fiber
     * 3. 返回下一个任务
     */
    //初始化dom
    if (!fiber.dom) {
        fiber.dom = createDOM(fiber);
    };

    //给children新建fiber
    const elements = fiber.props.children;
    let prevSibling = null;
    //构建 fiber tree
    for (let i = 0; i < elements.length; i++) {
        const newFiber = {
            type: elements[i].type,
            props: elements[i].props,
            parent: fiber,
            dom: null,
            child: null,
            sibling: null
        };
        //在fiber树中，父节点只将第一个子节点判定为child，其余的子节点呈链表态成为兄弟节点，
        //即一个为另一个的兄弟节点
        if (i == 0) fiber.child = newFiber;
        else prevSibling.sibling = newFiber;
        //最终父节点将子节点判定为兄弟节点
        prevSibling = newFiber;
    };
    if (fiber.child) {
        return fiber.child;
    };
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent
    };


}

export default render