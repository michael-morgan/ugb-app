const width = window.outerWidth;
const height = window.outerHeight;

//window.scroll(width/2, height/2);

const bracketMarkup = `
    <div class="bracket-container bracket-ninety-br first">
        <div class="connection-one"></div>
        <div class="connection-two"></div>
    </div>
`;
//document.getElementById("root").insertAdjacentHTML("beforeend", bracketMarkup);

function createBracket({ degree, orientation, connectionOne, connectionTwo, first }) {
    return `
        <div class="bracket-container bracket-${degree}-${orientation} ${first && 'first'}">
            ${connectionOne && '<div class="connection-one" onclick="handleConnection(this)"></div>'}
            ${connectionTwo && '<div class="connection-two" onclick="handleConnection(this)"></div>'}
        </div>
    `;
}

const timberMarkup = `
    <div class="timber-container timber-horizontal">
        <div class="connection-one"></div>
        <div class="connection-two"></div>
    </div>
`;
//document.getElementById("root").insertAdjacentHTML("beforeend", timberMarkup);

function createTimber({ orientation, connectionOne, connectionTwo }) {
    return `
        <div class="timber-container timber-${orientation}">
            ${connectionOne && '<div class="connection-one" onclick="handleConnection(this)"></div>'}
            ${connectionTwo && '<div class="connection-two" onclick="handleConnection(this)"></div>'}
        </div>
    `;
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

function getTimberOrientation


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

        switch(parentOrientation) {
            case "br":
                component.connectionOne = true;
                if(connection === "one") {
                    component.orientation = "horizontal";
                } else if (connection === "two") {
                    component.orientation = "vertical";
                }
            break;
            case "bl":
                if(connection === "one") {
                    component.connectionOne = true;
                    component.orientation = "vertical";
                } else if (connection === "two") {
                    component.connectionTwo = true;
                    component.orientation = "horizontal";
                }
            break;
            case "tr":
                if(connection === "one") {
                    component.connectionOne = true;
                    component.orientation = "horizontal";
                } else if (connection === "two") {
                    component.connectionTwo = true;
                    component.orientation = "vertical";
                }
            break;
            case "tl":
                if(connection === "one") {
                    component.orientation = "vertical";

                    nearbyElement = document.elementFromPoint(
                        elementProperties.x + (elementProperties.width / 2),
                        elementProperties.y + (elementProperties.height + (75 / 2))
                    );

                    component.connectionTwo = !nearbyElement;
                } else if (connection === "two") {
                    component.connectionTwo = true;
                    component.orientation = "horizontal";
                }
            break;
        }
    } else if (parentType === "timber") {
        component.type = "bracket";

        // TODO: Make dynamic
        // For now set all brackets to 90 degrees
        component.degree = "ninety";

        const bracketOrientation = e.parentElement.parentElement.parentElement.classList.item(1).split("-").slice(1)[1];

        switch(bracketOrientation) {
            case "br":
                if (parentOrientation === "horizontal") {
                    component.connectionOne = true;
                    component.orientation = "bl";
                } else if (parentOrientation === "vertical") {
                    component.connectionOne = true;
                    component.orientation = "tr";
                }
            break;
            case "bl":
                if (parentOrientation === "horizontal") {
                    component.connectionTwo = true;
                    component.orientation = "br";
                } else if (parentOrientation === "vertical") {
                    component.connectionTwo = true;
                    component.orientation = "tl";
                }
            break;
            case "tr":
                if (parentOrientation === "horizontal") {
                    component.connectionOne = true;
                    component.orientation = "tl";
                } else if (parentOrientation === "vertical") {
                    component.connectionOne = true;
                    component.orientation = "br";
                }
            break;
            case "tl":
                if (parentOrientation === "horizontal") {
                    component.orientation = "tr";

                    nearbyElement = document.elementFromPoint(
                        elementProperties.x + (elementProperties.width / 2),
                        elementProperties.y + (elementProperties.height * 2)
                    );

                    component.connectionTwo = !nearbyElement;
                } else if (parentOrientation === "vertical") {
                    component.connectionTwo = true;
                    component.orientation = "bl";
                }
            break;
        }
    }

    console.log(component);

    if (nearbyElement &&
    nearbyElement.className.includes("connection") &&
    nearbyElement.children.length === 0) {
        if (nearbyElement.parentElement.className.includes("bracket")) {
            const nearbyElementParentOrientation = nearbyElement.parentElement.classList.item(1).split("-").slice(1)[1];

            console.log("Nearby filled!");
            nearbyElement.insertAdjacentHTML("beforeend", createComponent({}));
        } else if (nearbyElement.parentElement.className.includes("timber")) {
            nearbyElement.insertAdjacentHTML("beforeend", createComponent({
                type: "bracket",
                degree: "ninety",
                orientation: "bl"
            }));
        }

        nearbyElement.removeAttribute("onclick");
    }

    e.insertAdjacentHTML("beforeend", createComponent(component));
    e.removeAttribute("onclick");
};