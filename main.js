import { createElement,render,useState } from "./micro-react";

const Counter = () => {
  const [count,setCount] = useState(0);
  return createElement('h1',{onclick:()=>{setCount(prev => prev + 1)}},count)
}

const element = createElement(Counter)

const container = document.querySelector('#root');

render(element,container);

