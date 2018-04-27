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
        "tl": { "one": "vertical", "two": "horizontal" },
        "horizontal": { "one": "horizontal", "two": "horizontal" },
        "vertical": { "one": "vertical", "two": "vertical" }
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
    console.log("Nearby element: ", element);
    return (
        (
            element.className.includes("connection")
            || element.className.includes("bracket")
            || element.className.includes("timber")
        ) ? element : null
    );
}

function createComponent({ type, degree, orientation, connectionOne, connectionTwo, first }) {
    var componentId = `component${componentCount + 1}`;
    return `
        <div
            id="${componentId}"
            class="${type}-container ${type}${degree ? `-${degree}` : ''}-${orientation} ${first ? 'first' : ''}"
            data-type="${type}"
            data-degree="${degree}"
            data-orientation="${orientation}"
            data-first="${first}"
        >
            ${connectionOne
                ?  `<div
                        id="${componentId}-connection1"
                        class="connection-one"
                        onclick="connectionClick(this)"
                        data-type="connection"
                        data-connection="one"
                        data-empty="true"
                    ></div>`
                : ""
            }
            ${connectionTwo
                ?  `<div
                        id="${componentId}-connection2"
                        class="connection-two"
                        onclick="connectionClick(this)"
                        data-type="connection"
                        data-connection="two"
                        data-empty="true"
                    ></div>`
                : ""
            }
            ${type === "bracket"
                ?  `<div
                        id="${componentId}-connection3"
                        class="connection-three"
                        onclick="connectionClick(this)"
                        data-type="connection"
                        data-connection="three"
                    ></div>`
                : ""
            }
        </div>
    `;
}

function swapType(type) {
    return type === "timber" ? "bracket" : "timber";
}

function rootEmpty() {
    return document.getElementById("root").childElementCount === 0;
}

function addComponent(parent, component, clearHistory = true) {
    if (parent.dataset.connection !== "three") {
        parent.dataset.empty = "false";
    }
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

    appendPrice(component.type);
}

function setFirstBracketLocation() {
    const firstBracket = document.querySelector("[data-first='true']");
    firstBracket.style.left = `${(firstBracketLocation.x - (firstBracket.clientWidth / 2))}px`;
    firstBracket.style.top = `${(firstBracketLocation.y - firstBracket.clientHeight / 2)}px`;
}

function appendPrice(type, modifier = 1) {
    const priceElement = document.getElementById("price");
    var price = parseFloat(priceElement.innerText || priceElement.textContent);
    if (type === "timber") {
        price += (modifier * 25);
    } else if (type === "bracket") {
        price += (modifier * 10);
    }
    priceElement.innerHTML = price.toFixed(2);
}

window.dialog = function(type, state) {
    const dialog = document.getElementById(`${type}Dialog`);
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

function handleConnection(connection, component = {}) {
    console.dir(connection);

    const parentType = connection.parentElement.dataset.type;
    console.log("Parent type: ", parentType);

    const parentOrientation = connection.parentElement.dataset.orientation;
    console.log("Parent orientation: ", parentOrientation);
    const parentDegree = connection.parentElement.dataset.degree;
    console.log("Parent degree: ", parentDegree);

    const connectionType = connection.dataset.connection;
    console.log("Connection: ", connectionType);

    const elementProperties = connection.getBoundingClientRect();
    console.log("Connection Bounding: ", elementProperties);
    let nearbyElement = null;
    let otherNearbyElement = null;

    //document.getElementById(`${swapType(parentType)}Dialog`).style.display = "none";

    if (component.type === "timber") {
        component.orientation = orientations[component.type][parentOrientation][connectionType];

        switch(parentOrientation) {
            case "br":
                if(connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );
                }

                component.connectionOne = !nearbyElement;
            break;
            case "bl":
                if(connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );

                    component.connectionOne = !nearbyElement;
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );

                    component.connectionTwo = !nearbyElement;
                }
            break;
            case "tr":
                if(connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );

                    component.connectionOne = !nearbyElement;
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );

                    component.connectionTwo = !nearbyElement;
                }
            break;
            case "tl":
                if(connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );
                }

                component.connectionTwo = !nearbyElement;
            break;
            case "horizontal":
                if(connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );

                    component.connectionOne = !nearbyElement;
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );

                    component.connectionTwo = !nearbyElement;
                }
            break;
            case "vertical":
                if(connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );

                    component.connectionOne = !nearbyElement;
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );

                    component.connectionTwo = !nearbyElement;
                }
            break;
        }
    } else if (component.type === "bracket") {
        const previousBracketOrientation = (connectionType === "three")
            ? connection.parentElement.dataset.orientation
            : connection.parentElement.parentElement.parentElement.dataset.orientation;
        console.log("Previous bracket orientation: ", previousBracketOrientation);
        const previousBracketDegree = (connectionType === "three")
            ? connection.parentElement.dataset.degree
            : connection.parentElement.parentElement.parentElement.dataset.degree;
        console.log("Previous bracket degree: ", previousBracketDegree);

        switch(previousBracketOrientation) {
            case "br":
                if (parentOrientation === "horizontal") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            -xPadding, yPadding
                        );
                        component.connectionOne = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "bl" && component.orientation !== "tl") {
                        component.orientation = "bl";
                    }

                    if (component.orientation === "bl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, -yPadding
                        );
                    } else if (component.orientation === "tl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, (elementProperties.height + yPadding)
                        );
                    }

                    component.connectionOne = !nearbyElement;
                } else if (parentOrientation === "vertical") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, -yPadding
                        );
                        component.connectionOne = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "tr" && component.orientation !== "tl") {
                        component.orientation = "tr";
                    }

                    if (component.orientation === "tr") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            -xPadding, yPadding
                        );
                        component.connectionOne = !nearbyElement;
                    } else if (component.orientation === "tl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            (elementProperties.width + xPadding), yPadding
                        );
                        component.connectionTwo = !nearbyElement;
                    }
                } else if (parentOrientation === "br") {
                    if (component.orientation !== "br") {
                        component.orientation = "br";
                    }

                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );
                    component.connectionOne = !nearbyElement;
                    otherNearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );
                    component.connectionTwo = !otherNearbyElement;
                }
            break;
            case "bl":
                if (parentOrientation === "horizontal") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            (elementProperties.width + xPadding), yPadding
                        );
                        component.connectionTwo = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "br" && component.orientation !== "tr") {
                        component.orientation = "br";
                    }

                    if (component.orientation === "br") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, -yPadding
                        );
                    } else if (component.orientation === "tr") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, (elementProperties.height + yPadding)
                        );
                    }

                    component.connectionTwo = !nearbyElement;
                } else if (parentOrientation === "vertical") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, -yPadding
                        );
                        component.connectionOne = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "tl" && component.orientation !== "tr") {
                        component.orientation = "tl";
                    }

                    if (component.orientation === "tl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            (elementProperties.width + xPadding), yPadding
                        );
                        component.connectionTwo = !nearbyElement;
                    } else if (component.orientation === "tr") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            -xPadding, yPadding
                        );
                        component.connectionOne = !nearbyElement;
                    }
                } else if (parentOrientation === "bl") {
                    if (component.orientation !== "bl") {
                        component.orientation = "bl";
                    }

                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );
                    component.connectionOne = !nearbyElement;
                    otherNearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );
                    component.connectionTwo = !otherNearbyElement;
                }
            break;
            case "tr":
                if (parentOrientation === "horizontal") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            -xPadding, yPadding
                        );
                        component.connectionOne = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "tl" && component.orientation !== "bl") {
                        component.orientation = "tl";
                    }

                    if (component.orientation === "tl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, (elementProperties.height + yPadding)
                        );
                    } else if (component.orientation === "bl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, -yPadding
                        );
                    }
                    component.connectionOne = !nearbyElement;
                } else if (parentOrientation === "vertical") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, (elementProperties.height + yPadding)
                        );
                        component.connectionTwo = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "br" && component.orientation !== "bl") {
                        component.orientation = "br";
                    }

                    if (component.orientation === "br") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            -xPadding, yPadding
                        );
                        component.connectionOne = !nearbyElement;
                    } else if (component.orientation === "bl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            (elementProperties.width + xPadding), yPadding
                        );
                        component.connectionTwo = !nearbyElement;
                    }
                } else if (parentOrientation === "tr") {
                    if (component.orientation !== "tr") {
                        component.orientation = "tr";
                    }

                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );
                    component.connectionOne = !nearbyElement;
                    otherNearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );
                    component.connectionTwo = !otherNearbyElement;
                }
            break;
            case "tl":
                if (parentOrientation === "horizontal") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            (elementProperties.width + xPadding), yPadding
                        );
                        component.connectionTwo = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "tr" && component.orientation !== "br") {
                        component.orientation = "tr";
                    }

                    if (component.orientation === "tr") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, (elementProperties.height + yPadding)
                        );
                    } else if (component.orientation === "br") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, -yPadding
                        );
                    }
                    component.connectionTwo = !nearbyElement;
                } else if (parentOrientation === "vertical") {
                    if (component.orientation.length !== 2) {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            xPadding, (elementProperties.height + yPadding)
                        );
                        component.connectionTwo = !nearbyElement;
                        break;
                    }

                    if (component.orientation !== "bl" && component.orientation !== "br") {
                        component.orientation = "bl";
                    }

                    if (component.orientation === "bl") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            (elementProperties.width + xPadding), yPadding
                        );
                        component.connectionTwo = !nearbyElement;
                    } else if (component.orientation === "br") {
                        nearbyElement = getNearbyElement(
                            elementProperties.x, elementProperties.y,
                            -xPadding, yPadding
                        );
                        component.connectionOne = !nearbyElement;
                    }
                } else if (parentOrientation === "tl") {
                    if (component.orientation !== "tl") {
                        component.orientation = "tl";
                    }

                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );
                    component.connectionOne = !nearbyElement;
                    otherNearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );
                    component.connectionTwo = !otherNearbyElement;
                }
            break;
            case "horizontal":
                if (connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        -xPadding, yPadding
                    );
                    component.connectionOne = !nearbyElement;
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        (elementProperties.width + xPadding), yPadding
                    );
                    component.connectionTwo = !nearbyElement;
                }
            break;
            case "vertical":
                if (connectionType === "one") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, -yPadding
                    );
                    component.connectionOne = !nearbyElement;
                } else if (connectionType === "two") {
                    nearbyElement = getNearbyElement(
                        elementProperties.x, elementProperties.y,
                        xPadding, (elementProperties.height + yPadding)
                    );
                    component.connectionTwo = !nearbyElement;
                }
            break;
        }
    }

    console.log("nearbyElement: ", nearbyElement);
    console.log("New Component: ", component);

    /* Auto-complete nearby element logic */
    /*if (nearbyElement && nearbyElement.children.length === 0) {
        let nearbyElementComponent = {
            type: null,
            degree: null,
            orientation: null,
        };
        let nearbyElementParentOrientation = null;

        if (nearbyElement.parentElement.className.includes("bracket")) {
            if (nearbyElement.dataset.connection === "three") {
                nearbyElementComponent.type = "bracket";
            } else {
                nearbyElementComponent.type = "timber";

                nearbyElementParentOrientation = nearbyElement
                                                    .parentElement
                                                    .classList.item(1).split("-").slice(1)[1];
                const nearbyElementConnection = nearbyElement.className.split("-").slice(1);

                nearbyElementComponent.orientation = orientations
                                                        [nearbyElementComponent.type]
                                                        [nearbyElementParentOrientation]
                                                        [nearbyElementConnection];
            }
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
    }*/

    addComponent(connection, component);

    //dialog(`${swapType(parentType)}`, "hide");
}

function handleStack() {

}

/* START Events */
window.connectionClick = (e) => {
    clickedConnection = e.target || e;
    //dialog(`${swapType(clickedConnection.parentElement.dataset.type)}`, "show");
    applyConnection();
};

window.applyConnection = function() {

    //let dialogElement = null;

    if (rootEmpty()) {
        var rootElement = document.getElementById("root");
        //dialogElement = document.getElementById("bracketDialog");
        //console.dir(dialogElement);

        addComponent(rootElement, {
            type: "bracket",
            degree: document.getElementById("bracketComponentDegree").value,
            orientation: document.getElementById("bracketComponentOrientation").value,
            connectionOne: true,
            connectionTwo: true,
            first: true
        });

        setFirstBracketLocation();

        //dialog("bracket", "hide");
        return;
    }

    const connectionType = clickedConnection.dataset.connection;

    if (connectionType === "three"
        && document.querySelectorAll(
            "[data-type='connection'][data-empty='true']"
        ).length) {
        return;
    }

    const type = (connectionType === "three") ? "bracket" : swapType(clickedConnection.parentElement.dataset.type);
    //dialogElement = document.getElementById(`${type}Dialog`);
    handleConnection(clickedConnection, {
        type,
        degree: (type === "bracket" ? document.getElementById("bracketComponentDegree").value : null),
        orientation: (type === "bracket" ? document.getElementById("bracketComponentOrientation").value : null)
    });

    handleStack();
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

    appendPrice(removed.element.type, -1);
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

window.swapSubToolbar = function() {
    const componentType = document.getElementById("componentType");
    const bracketTools = document.getElementById("bracketTools");
    const timberTools = document.getElementById("timberTools");

    if (componentType.textContent === "B") {
        componentType.textContent = "T";
        bracketTools.style.display = "none";
        timberTools.style.display = "inline-block";
    } else {
        componentType.textContent = "B";
        timberTools.style.display = "none";
        bracketTools.style.display = "inline-block";
    }
};

window.degreeChange = function(e) {
    const degree = e.target.value;
    let orientationContent;
    switch (degree) {
        case "ninety":
        orientationContent = document.getElementById("ninetyOrientations").innerHTML;
        break;
        case "oneeighty":
        orientationContent = document.getElementById("oneeightyOrientations").innerHTML;
        break;
    }
    document.getElementById("bracketComponentOrientation").innerHTML = orientationContent;
};

window.colorChange = function(e) {
    const parentId = e.target.parentElement.id;
    let color;
    let type;
    if (parentId.includes("bracket")) {
        type = "bracket";
        switch (e.target.value) {
            case "black":
            color = "black";
            break;
            case "copper":
            color = "firebrick";
            break;
        }
    } else if (parentId.includes("timber")) {
        type = "timber";
        switch (e.target.value) {
            case "chestnut":
            color = "saddlebrown";
            break;
            case "grey":
            color = "grey";
            break;
        }
    }
    const elements = document.querySelectorAll(`[data-type="${type}"]`);
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.backgroundColor = color;
    }
};

function handleClick(e) {
    if (rootEmpty()) {
        firstBracketLocation.x = e.offsetX;
        firstBracketLocation.y = e.offsetY;
        //dialog("bracket", "show");
        applyConnection();
    }
}

document.getElementById("root").addEventListener("click", handleClick, true);
/* END Events */
