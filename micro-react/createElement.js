function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            //map children to config
            children: children.map(child =>
                typeof child === 'object' ? child : createTextElement(child)
            )
        }
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

export default createElement