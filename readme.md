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

**fiber tree**

![](./md_resources/fiber1.png)


如右图所示，fiber树渲染dom的顺序为：child -> sibling -> parent

以右图为例：root -> div -> h1 -> p -> a -> h1 -> h2 -> div -> root