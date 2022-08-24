# 手撕React

## steps

### Step1: `createElement` function
### Step2: `render` function
### Step3: Concurrent Mode
### Step4: Fibers
### Step5: Render and Commit Phases
### Step6: Reconcilication
### Step7: Function Components
### Step8: React-Hook

---

## point of knowledge

### 1. Fiber 架构是什么？

**定义：**  
Fiber是一种架构，用于解决 react 15 时的一个问题 ： 一旦react重新渲染，便不能中断，如果这次渲染的层级很深，这将造成主线程的阻塞。  

**原理：**  
Fiber将渲染过程分为了几个优先级，每完成一个优先级的渲染进程就会把线程还给浏览器，直到浏览器空闲再允许React完成下一优先级的渲染进程。  

**实现方式：**  
在过去，也就是 React 16 的时代，Fiber使用了 window.requestIdleCallback(), 该方法的功能为：浏览器空闲时，执行回调。   

而在现在，React 使用了 一个 scheduler package

Fiber架构将整个过程分为渲染过程render和提交过程commit：  
渲染过程最终会构建出一个fiber tree(处理数据)  
提交过程用原生DOM 的API将fiber渲染出来(实际渲染)

**render过程由于requestIdleCallback的存在，它是异步的**
**commit过程是同步的**

**fiber tree**

![](./md_resources/fiber1.png)


如右图所示，fiber树渲染dom的顺序为：child -> sibling -> parent

以右图为例：root -> div -> h1 -> p -> a -> h1 -> h2 -> div -> root