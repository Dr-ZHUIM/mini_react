//创建虚拟dom
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
        //访问上一次的fiber
        alternate: currentRoot,
        //存储本次渲染将要移除fiber
        sibling: null,
        child: null,
        parent: null
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

const isEvent = key => key.startsWith("on")
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);


function updateDom(dom, prevProps, nextProps) {
    //移除旧的events
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        });
    //移除旧的props
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ""
        })
    //更新新的props
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })
    //增加新的event
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    //如果当前fiber的父级没有dom则向上查找
    let domParentFiber = fiber.parent;
    while(!domParentFiber.dom){
        domParentFiber = domParentFiber.parent
    }
    const parentDOM = domParentFiber.dom;
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        parentDOM.appendChild(fiber.dom);
    } else if (fiber.effectTag === 'DELETION') {
        commitDeletion(fiber,parentDOM)
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function commitDeletion(fiber,domParent){
    if(fiber.dom){
        domParent.removeChild(fiber.dom);
    }else{
        commitDeletion(fiber.child,domParent);
    }
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

    const isFunctionComponent = fiber.type instanceof Function;
    if(isFunctionComponent){
        updateFunctionComponent(fiber)
    }else{
        updateHostComponent(fiber)
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

//处理非函数式组件
function updateHostComponent(fiber){
    if (!fiber.dom) {
        fiber.dom = createDOM(fiber);
    };
    //给children新建fiber
    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);
}

//处理函数式组件
let wipFiber = null;
let hookIndex = null;
function updateFunctionComponent(fiber){
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber,children);
}

export function useState(init){
    const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
    const hook = {
        state : oldHook ? oldHook.state : init,
        queue:[]
    };
    const actions = oldHook?oldHook.queue:[];
    actions.forEach(action=>{
        hook.state = action(hook.state)
    });
    const setState = (action) =>{
        hook.queue.push(action);
        wipRoot = {
            dom:currentRoot.dom,
            props:currentRoot.props,
            alternate:currentRoot
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    }
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state,setState]
}

function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

    let prevSibling = null;
    while (index < elements.length || oldFiber != null) {
        const element = elements[index];
        let newFiber = null;
        //比较新的fiber与旧的fiber的类型是否相同
        /**
         * 如果相同，保留原来的DOM node，更新props
         * 如果不同，并且添加了新的fiber，则创建新的DOM node
         * 如果不同，却仍然保留了旧的fiber，则需要移除它
         */
        const sameType = oldFiber && element && element.type == oldFiber.type;
        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE"
            }
        }
        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT"
            }
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if(index === 0){
            wipFiber.child = newFiber
        }else{
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index ++
    }
}

export default render