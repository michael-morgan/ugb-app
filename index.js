const width = window.outerWidth;
const height = window.outerHeight;

const xPadding = 5;
const yPadding = 5;

const orientations = {
    "timber": {
        "br": { "one": "horizontal", "two": "vertical" },
        "bl": { "one": "vertical", "two": "horizontal" },
        "tr": { "one": "horizontal", "two": "vertical" },
        "tl": { "one": "vertical", "two": "horizontal" }
    },
    "bracket": {
        "br": { "horizontal": "bl", "vertical": "tr" },
        "bl": { "horizontal": "br", "vertical": "tl" },
        "tr": { "horizontal": "tl", "vertical": "br" },
        "tl": { "horizontal": "tr", "vertical": "bl" }
    }
};

//window.scroll(width/2, height/2);

/*
const bracketMarkup = `
    <div class="bracket-container bracket-ninety-br first">
        <div class="connection-one"></div>
        <div class="connection-two"></div>
    </div>
`;

const timberMarkup = `
    <div class="timber-container timber-horizontal">
        <div class="connection-one"></div>
        <div class="connection-two"></div>
    </div>
`;
*/

function getNearbyElement(x, y, xoffset, yoffset) {
    const element = document.elementFromPoint(x + xoffset, y + yoffset);
    return (
        element.className.includes("bracket") ||
        element.className.includes("timber") ||
        element.className.includes("connection")
    ) ? element : null;
}

function createComponent({ type, degree, orientation, connectionOne, connectionTwo, first }) {
    return `
        <div class="${type}-container ${type}${degree ? `-${degree}` : ''}-${orientation} ${first ? 'first' : ''}">
            ${connectionOne ? '<div class="connection-one" onclick="handleConnection(this)"></div>' : ''}
            ${connectionTwo ? '<div class="connection-two" onclick="handleConnection(this)"></div>' : ''}
        </div>
    `;
}

const markup = createComponent({
    type: "bracket",
    degree: "ninety",
    orientation: "br",
    connectionOne: true,
    connectionTwo: true,
    first: true
});
document.getElementById("root").insertAdjacentHTML("beforeend", markup);

/* Events */
window.handleConnection = (e) => {
    console.dir(e);

    let component = {
        type: null,
        degree: null,
        orientation: null,
        connectionOne: null,
        connectionTwo: null,
        first: null,
    };

    const parentType = e.parentElement.classList.item(0).split("-")[0];
    console.log("Parent type: ", parentType);

    const props = e.parentElement.classList.item(1).split("-").slice(1);
    const parentOrientation = props[+(props.length > 1)];
    console.log("Parent orientation: ", parentOrientation);
    const parentDegree = props[0];
    console.log("Parent degree: ", parentDegree);
    
    const connection = e.className.split("-")[1];
    console.log("Connection: ", connection);

    const elementProperties = e.getBoundingClientRect();
    let nearbyElement = null;

    if (parentType === "bracket") {
        component.type = "timber";
        component.orientation = orientations[component.type][parentOrientation][connection];

        switch(parentOrientation) {
            case "br":
                if(connection === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );
                } else if (connection === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );
                }

                component.connectionOne = !nearbyElement;
            break;
            case "bl":
                if(connection === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );

                    component.connectionOne = !nearbyElement;
                } else if (connection === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );

                    component.connectionTwo = !nearbyElement;
                }
            break;
            case "tr":
                if(connection === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );

                    component.connectionOne = !nearbyElement;
                } else if (connection === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );

                    component.connectionTwo = !nearbyElement;
                }
            break;
            case "tl":
                if(connection === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );
                } else if (connection === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );
                }

                component.connectionTwo = !nearbyElement;
            break;
        }
    } else if (parentType === "timber") {
        component.type = "bracket";

        // TODO: Make dynamic
        // For now set all brackets to 90 degrees
        component.degree = "ninety";

        const previousBracketOrientation = e.parentElement.parentElement.parentElement.classList.item(1).split("-").slice(1)[1];
        component.orientation = orientations[component.type][previousBracketOrientation][parentOrientation];

        switch(previousBracketOrientation) {
            case "br":
                if (parentOrientation === "horizontal") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );
                } else if (parentOrientation === "vertical") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );
                }

                component.connectionOne = !nearbyElement;
            break;
            case "bl":
                if (parentOrientation === "horizontal") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );
                } else if (parentOrientation === "vertical") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );
                }

                component.connectionTwo = !nearbyElement;
            break;
            case "tr":
                if (parentOrientation === "horizontal") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );
                } else if (parentOrientation === "vertical") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );
                }

                component.connectionOne = !nearbyElement;
            break;
            case "tl":
                if (parentOrientation === "horizontal") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );
                } else if (parentOrientation === "vertical") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );
                }

                component.connectionTwo = !nearbyElement;
            break;
        }
    }

    console.log("nearbyElement: ");
    console.dir(nearbyElement);

    console.log("New Component: ", component);

    if (nearbyElement &&
    nearbyElement.className.includes("connection") &&
    nearbyElement.children.length === 0) {
        let nearbyElementComponent = {
            type: null,
            degree: null,
            orientation: null,
        };
        let nearbyElementParentOrientation = null;

        if (nearbyElement.parentElement.className.includes("bracket")) {
            nearbyElementComponent.type = "timber";
            
            nearbyElementParentOrientation = nearbyElement
                                                .parentElement
                                                .classList.item(1).split("-").slice(1)[1];
            const nearbyElementConnection = nearbyElement.className.split("-").slice(1);

            nearbyElementComponent.orientation = orientations
                                                    [nearbyElementComponent.type]
                                                    [nearbyElementParentOrientation]
                                                    [nearbyElementConnection];
        } else if (nearbyElement.parentElement.className.includes("timber")) {
            nearbyElementComponent.type = "bracket";
            nearbyElementComponent.degree = "ninety";

            const previousNearbyBracketOrientation = nearbyElement
                                                        .parentElement
                                                        .parentElement
                                                        .parentElement
                                                        .classList.item(1).split("-").slice(1)[1];
            nearbyElementParentOrientation = nearbyElement
                                                .parentElement
                                                .classList.item(1).split("-").slice(1)[0];

            nearbyElementComponent.orientation = orientations
                                                    [nearbyElementComponent.type]
                                                    [previousNearbyBracketOrientation]
                                                    [nearbyElementParentOrientation];
        }

        nearbyElement.insertAdjacentHTML("beforeend", createComponent(nearbyElementComponent));
        nearbyElement.removeAttribute("onclick");
    }

    e.insertAdjacentHTML("beforeend", createComponent(component));
    e.removeAttribute("onclick");
};

window.openSplitterSide = () => {
    document.getElementById('menu').open();
};