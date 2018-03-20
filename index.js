/* START Constants */
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
/* END Constants */

/* START Locals */
var clickedConnection;

var recentlyAdded = [], recentlyRemoved = [];

var componentCount = 0;

var firstBracketLocation = { x: 0, y: 0 };
/* END Locals */

window.scroll(width/2, height/2);

function getNearbyElement(x, y, xoffset, yoffset) {
    const element = document.elementFromPoint(x + xoffset, y + yoffset);
    return (
        element.className.includes("bracket") ||
        element.className.includes("timber") ||
        element.className.includes("connection")
    ) ? element : null;
}

function createComponent({ type, degree, orientation, connectionOne, connectionTwo, first }) {
    var componentId = `component${componentCount + 1}`;
    return `
        <div id="${componentId}" class="${type}-container ${type}${degree ? `-${degree}` : ''}-${orientation} ${first ? 'first' : ''}">
            ${connectionOne ? `<div id="${componentId}-connection1" class="connection-one" onclick="connectionClick(this)"></div>` : ''}
            ${connectionTwo ? `<div id="${componentId}-connection2" class="connection-two" onclick="connectionClick(this)"></div>` : ''}
        </div>
    `;
}

function connectionParentType(e) {
    return e.parentElement.classList.item(0).split("-")[0];
}

function connectionParentProps(e) {
    return e.parentElement.classList.item(1).split("-").slice(1);
}

function connectionType(e) {
    return e.className.split("-")[1];
}

function swapType(type) {
    return type === "timber" ? "bracket" : "timber";
}

function rootEmpty() {
    return document.getElementById("root").childElementCount === 0;
}

function addComponent(parent, component, clearHistory = true) {
    parent.insertAdjacentHTML("beforeend", createComponent(component));
    componentCount++;

    if (componentCount > 1) {
        parent.removeAttribute("onclick");
        parent.removeEventListener("click", connectionClick, true);
    }

    recentlyAdded.push({
        "parent": parent.id,
        "element": Object.assign({}, component)
    });

    document.getElementById("undoButton").removeAttribute("disabled", "");
    if (clearHistory) {
        recentlyRemoved = [];
        document.getElementById("redoButton").setAttribute("disabled", "");
    }
}

function setFirstBracketLocation() {
    const firstBracket = document.querySelector(".bracket-container.first");
    firstBracket.style.left = `${(firstBracketLocation.x - (firstBracket.clientWidth / 2))}px`;
    firstBracket.style.top = `${(firstBracketLocation.y - firstBracket.clientHeight / 2)}px`;
}

const firstComponent = {
    type: "bracket",
    degree: "ninety",
    orientation: "br",
    connectionOne: true,
    connectionTwo: true,
    first: true
};

window.dialog = function(type, state) {
    const dialog = document.getElementById(`${type}-dialog`);
    if (state === "show") {
        try {
            dialog.show();
        } catch(e) {
            console.log(`${type} dialog not found. Creating..`);
            ons.createDialog(`${type}-dialog.html`).then(function(dialog) {
                dialog.show();
            });
        }
    } else {
        try {
            dialog.hide();
        } catch(e) {}
    }
}

function handleConnection(e) {
    console.dir(e);

    let component = {
        type: null,
        degree: null,
        orientation: null,
        connectionOne: null,
        connectionTwo: null,
        first: null,
    };

    const parentType = connectionParentType(e);
    console.log("Parent type: ", parentType);

    const parentProps = connectionParentProps(e);
    const parentOrientation = parentProps[+(parentProps.length > 1)];
    console.log("Parent orientation: ", parentOrientation);
    const parentDegree = parentProps[0];
    console.log("Parent degree: ", parentDegree);

    const connection = connectionType(e);
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

        addComponent(nearbyElement, nearbyElementComponent);
    }

    addComponent(e, component);

    dialog(`${swapType(parentType)}`, "hide");
}

/* START Events */
window.connectionClick = (e) => {
    clickedConnection = e.target || e;
    dialog(`${swapType(connectionParentType(clickedConnection))}`, "show");
};

window.applyConnection = function() {
    if (rootEmpty()) {
        var rootElement = document.getElementById("root");
        // Static first item till dialogs complete
        addComponent(rootElement, firstComponent);

        setFirstBracketLocation();

        dialog("bracket", "hide");
        return;
    }

    handleConnection(clickedConnection);
};

window.openSplitterSide = function() {
    document.getElementById("menu").open();
};

window.undoConnection = function() {
    if (recentlyAdded.length === 0) { return; }

    const removed = recentlyAdded.pop();
    const parent = document.getElementById(removed.parent);
    recentlyRemoved.push({ "parent": removed.parent, "element": Object.assign({}, removed.element) });
    parent.children[0].remove();
    componentCount--;

    if (!rootEmpty()) {
        parent.addEventListener("click", connectionClick, true);
    }

    document.getElementById("redoButton").removeAttribute("disabled", "");
    if (componentCount === 0) {
        document.getElementById("undoButton").setAttribute("disabled", "");
    }
};

window.redoConnection = function() {
    if (recentlyRemoved.length === 0) { return; }

    const added = recentlyRemoved.pop();
    const parent = document.getElementById(added.parent);
    addComponent(parent, added.element, false);

    if (added.parent === "root") {
        setFirstBracketLocation();
    }

    document.getElementById("undoButton").removeAttribute("disabled", "");
    if (recentlyRemoved.length === 0) {
        document.getElementById("redoButton").setAttribute("disabled", "");
    }
};

function handleClick(e) {
    if (rootEmpty()) {
        firstBracketLocation.x = e.offsetX;
        firstBracketLocation.y = e.offsetY;
        dialog("bracket", "show");
    }
}

document.getElementById("root").addEventListener("click", handleClick, true);
/* END Events */
