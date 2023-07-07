import createElement from "./module/createElement";
import render from "./module/render";
// react element
const element = createElement(
  "div",
  {id: "foo"},
  createElement("a",null,"bar"),
  createElement("b")
)

render(element,document.getElementById("root"));
