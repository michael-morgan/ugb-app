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
    console.log("Nearby element: ");
    console.dir(element);
    return (
        (element.className.includes("connection")
        || element.className.includes("bracket")
        || element.className.includes("timber")) ? element : null
    );
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

function getConnectionType(e) {
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

    appendPrice(component.type);
}

function setFirstBracketLocation() {
    const firstBracket = document.querySelector(".bracket-container.first");
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

    const parentType = connectionParentType(connection);
    console.log("Parent type: ", parentType);

    const parentProps = connectionParentProps(connection);
    const parentOrientation = parentProps[+(parentProps.length > 1)];
    console.log("Parent orientation: ", parentOrientation);
    const parentDegree = parentProps[0];
    console.log("Parent degree: ", parentDegree);

    const connectionType = getConnectionType(connection);
    console.log("Connection: ", connectionType);

    const elementProperties = connection.getBoundingClientRect();
    console.log("Connection Bounding: ", elementProperties);
    let nearbyElement = null;

    document.getElementById(`${swapType(parentType)}Dialog`).style.display = "none";

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
        }
    } else if (component.type === "bracket") {
        const previousBracketOrientation = connection.parentElement.parentElement.parentElement.classList.item(1).split("-").slice(1)[1];
        console.log("Previous bracket orientation: ", previousBracketOrientation);
        const previousBracketDegree = connection.parentElement.parentElement.parentElement.classList.item(1).split("-").slice(1)[0];
        console.log("Previous bracket degree: ", previousBracketDegree);

        switch(previousBracketOrientation) {
            case "br":
                if (parentOrientation === "horizontal") {
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
                            xPadding, yPadding
                        );
                    }

                    component.connectionOne = !nearbyElement;
                } else if (parentOrientation === "vertical") {
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
                }
            break;
            case "bl":
                if (parentOrientation === "horizontal") {
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
                            xPadding, yPadding
                        );
                    }

                    component.connectionTwo = !nearbyElement;
                } else if (parentOrientation === "vertical") {
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
                }
            break;
            case "tr":
                if (parentOrientation === "horizontal") {
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
                }
            break;
            case "tl":
                if (parentOrientation === "horizontal") {
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
                }
            break;
        }
    }

    console.log("nearbyElement: ");
    console.dir(nearbyElement);

    console.log("New Component: ", component);

    if (nearbyElement && nearbyElement.children.length === 0) {
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

    addComponent(connection, component);

    dialog(`${swapType(parentType)}`, "hide");
}

/* START Events */
window.connectionClick = (e) => {
    clickedConnection = e.target || e;
    dialog(`${swapType(connectionParentType(clickedConnection))}`, "show");
};

window.applyConnection = function() {
    let dialogElement = null;

    if (rootEmpty()) {
        var rootElement = document.getElementById("root");
        dialogElement = document.getElementById("bracketDialog");
        console.dir(dialogElement);

        addComponent(rootElement, {
            type: "bracket",
            degree: dialogElement.querySelector("#bracketDegree").value,
            orientation: dialogElement.querySelector("#bracketOrientation").value,
            connectionOne: true,
            connectionTwo: true,
            first: true
        });

        setFirstBracketLocation();

        dialog("bracket", "hide");
        return;
    }

    const type = swapType(connectionParentType(clickedConnection));
    dialogElement = document.getElementById(`${type}Dialog`);
    handleConnection(clickedConnection, {
        type,
        degree: (type === "bracket" ? dialogElement.querySelector("#bracketDegree").value : null),
        orientation: (type === "bracket" ? dialogElement.querySelector("#bracketOrientation").value : null)
    });
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

function handleClick(e) {
    if (rootEmpty()) {
        firstBracketLocation.x = e.offsetX;
        firstBracketLocation.y = e.offsetY;
        dialog("bracket", "show");
    }
}

document.getElementById("root").addEventListener("click", handleClick, true);
/* END Events */
