import createElement from "./module/createElement";
import render, { useState } from "./module/render";
/** @jsx createElement */
function App(props) {
  const [num, setNum] = useState(0);
  return (
    <h1
      onClick={() => {
        setNum((v) => v + 1);
        console.log(123);
      }}
    >
      Hi {props.name} {num}
    </h1>
  );
}

const element = createElement(App, {
  name: "foo",
});

render(element, document.getElementById("root"));

requestIdleCallback(() => console.log(1));
