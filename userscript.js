// ==UserScript==
// @name AppInventor Search Blocks
// @namespace x
// @version 0.1
// @description
// @author x
// @match http://ai2.appinventor.mit.edu/*
// @grant none
// @run-at document-end
// ==/UserScript==



window.addEventListener("load", function () {
    console.log("violent http://ai2.appinventor.mit.edu/ ")
    let currentIndex = 0;
    let listAllMatchingElements = [];
    let listIdTempHighlight = []
    let listForHighlights = []

    function searchMatchingElements() {
        const searchTerm = document.getElementById("searchTerm").value;
        const injectionDiv = document.querySelector(".blocklyWorkspace"); //injectionDiv
        const blocklyTextElements = injectionDiv.querySelectorAll(".blocklyText");
        currentIndex = 0;
        listAllMatchingElements = [];
        for (const blocklyText of blocklyTextElements) {
            if (blocklyText.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                listAllMatchingElements.push(blocklyText);
            }
        }
        displayContent();
    }

    function displayContent() {

        // # .... * remove previous highlight and delete the list
        console.log(listIdTempHighlight)
        for (const id of listIdTempHighlight) {
            try {
                var element = document.getElementById(id);
                element.parentNode.removeChild(element);
            } catch (error) {}
        }
        listIdTempHighlight = []
        listForHighlights = []


        // # .... * set the display of search buttons/span
        document.getElementById("highlightCurrentBlockBtn").disabled = false;
        const lengtlistAllMatchingElements = listAllMatchingElements.length
        if (lengtlistAllMatchingElements != 0) { // if more than 1 item
            document.getElementById("indexContent").innerText = currentIndex + 1 + "/" + (lengtlistAllMatchingElements) + "―"
            if (lengtlistAllMatchingElements > 1) { // if more than 1 item
                if (currentIndex > 0) {
                    document.getElementById("previousContent").disabled = false;
                } else {
                    document.getElementById("previousContent").disabled = true;
                }

                if (currentIndex < lengtlistAllMatchingElements - 1) {
                    document.getElementById("nextContent").disabled = false;
                } else {
                    document.getElementById("nextContent").disabled = true;
                }
            } else {
                document.getElementById("previousContent").disabled = true;
                document.getElementById("nextContent").disabled = true;
            }
        } else {
            document.getElementById("previousContent").disabled = true;
            document.getElementById("nextContent").disabled = true;
            document.getElementById("indexContent").innerText = ""

        }


        // # .... * retireve the matching element
        const currentMatchingElement = listAllMatchingElements[currentIndex];

        // find its parent
        if (currentMatchingElement) {
            var numberParent = 0;
            var parentNodeMatchingElement = currentMatchingElement.parentNode;

            if (parentNodeMatchingElement) {

                //  find the first parent of the element whose parent is blocklyBlockCanvas
                while (parentNodeMatchingElement && !parentNodeMatchingElement.classList.contains("blocklyBlockCanvas")) {
                    // console.log(parentNodeMatchingElement);
                    if (parentNodeMatchingElement.parentNode.classList.contains("blocklyBlockCanvas")) {
                        // console.log("blocklyBlockCanvas")
                        break;
                    } else {
                        numberParent += 1;
                        parentNodeMatchingElement = parentNodeMatchingElement.parentNode;
                    }
                }

                // # .... * highlight the matching element
                // set the size of the path
                var sizePathChild = 0.1;
                if (numberParent > 1) {
                    sizePathChild = 0.2;
                }
                if (numberParent > 3) {
                    sizePathChild = 0.3;
                }

                // the first parent is needed becausethe matching element is a text element and not a g element
                createPath(currentMatchingElement.parentNode, 0.6, "red", sizePathChild)
                listForHighlights.push([currentMatchingElement.parentNode, 0.6, "red", sizePathChild])

                if (parentNodeMatchingElement) {
                    // # .... * highlight the parent
                    createPath(parentNodeMatchingElement, 0.3, "yellow", 0.1)
                    listForHighlights.push([parentNodeMatchingElement, 0.3, "yellow", 0.1])


                    // # .... * change the view
                    var translate1, translate2;

                    // find the translate values
                    var parentNodeMatchingElementTransform = parentNodeMatchingElement.getAttribute("transform");

                    [translate1, translate2] = parentNodeMatchingElementTransform.match(/[-]?\d+(\.\d+)?/g).map(num => -1 * parseFloat(num));
                    // console.log(currentMatchingElement.textContent, "  ", parentNodeMatchingElementTransform, "   ", translate1, "   ", translate2)

                    // find the scale value
                    const currentScale = document.querySelector(".blocklyBlockCanvas").getAttribute("transform").match(/scale\(([^\)]+)\)/)[1];

                    // change the view
                    const blocklyBlockCanvas = document.querySelector(".blocklyBlockCanvas");
                    blocklyBlockCanvas.setAttribute("transform", `translate(${translate1}, ${translate2}) scale(${currentScale})`);
                    const blocklyBubbleCanvas = document.querySelector(".blocklyBubbleCanvas");
                    blocklyBubbleCanvas.setAttribute("transform", `translate(${translate1}, ${translate2}) scale(${currentScale})`);

                    // for debug
                    //  document.querySelector(".blocklyBlockCanvas").getAttribute("transform")    //
                    //   document.querySelector(".blocklyBlockCanvas").setAttribute("transform", 'translate(110,-110) scale(1)')

                    // # .... * display the content
                    document.getElementById("contentDisplay").innerText = currentMatchingElement.textContent + " (parent: " + numberParent + ")"

                } else {
                    document.getElementById("contentDisplay").innerText = "No element found"
                }

            } else {
                document.getElementById("contentDisplay").innerText = "No element found"

            }
        }
    }




    function createPath(node, opacity, color, sizepath) {
        console.log(node, opacity, color, sizepath)
        var pathString = returnPath(node, sizepath)
        var pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathElement.setAttribute("d", pathString);
        pathElement.setAttribute("fill", color);
        pathElement.setAttribute("opacity", opacity);
        const idTempHighlight = "tempHighlight" + Math.random().toString(36).substring(7);
        listIdTempHighlight.push(idTempHighlight)
        pathElement.setAttribute("id", idTempHighlight);
        node.appendChild(pathElement);

        setTimeout(() => {
            try {
                var element = document.getElementById(idTempHighlight);
                element.parentNode.removeChild(element);
                listIdTempHighlight.splice(listIdTempHighlight.indexOf(idTempHighlight), 1);
            } catch (error) {}
        }, 3000);
    }

    function previousContent() {
        if (currentIndex > 0) {
            currentIndex--;
            displayContent();
        }
    }

    function nextContent() {
        if (currentIndex < listAllMatchingElements.length - 1) {
            currentIndex++;
            displayContent();
        }
    }

    function returnPath(element, factor) {

        let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;
        for (const child of element.children) {
            const bbox = child.getBBox();
            minX = Math.min(minX, bbox.x);
            maxX = Math.max(maxX, bbox.x + bbox.width);
            minY = Math.min(minY, bbox.y);
            maxY = Math.max(maxY, bbox.y + bbox.height);
        }
        var width = maxX - minX;
        var height = maxY - minY;
        var widthA = width * factor;
        var heightA = height * factor;
        var widthB = width + 2 * widthA;
        var heightB = height + 2 * heightA;
        return `M-${widthA},-${heightA} H${widthB} V${heightB} H-${widthA} V-${heightA} Z`;
    }

    function highlightCurrentBlock() {
        for (each of listForHighlights) {
            createPath(each[0], each[1], each[2], each[3])
        }
    }

    const textBox = document.createElement("input");
    textBox.type = "text";
    textBox.id = "searchTerm";

    const scaleZOOM = document.createElement("span");
    scaleZOOM.id = "scaleZOOM";
    scaleZOOM.style.display = "inline-block";

    const searchButton = document.createElement("button");
    searchButton.innerText = "Search";
    searchButton.addEventListener("click", searchMatchingElements);

    const indexContent = document.createElement("span");
    indexContent.id = "indexContent";
    indexContent.style.display = "inline-block";

    const previousButton = document.createElement("button");
    previousButton.innerText = "←";
    previousButton.id = "previousContent";
    previousButton.style.display = "inline-block";
    previousButton.disabled = true;
    previousButton.addEventListener("click", previousContent);


    const nextButton = document.createElement("button");
    nextButton.innerText = "→";
    nextButton.id = "nextContent";
    nextButton.style.display = "inline-block";
    nextButton.disabled = true;
    nextButton.addEventListener("click", nextContent);

    const contentDisplay = document.createElement("div");
    contentDisplay.id = "contentDisplay";
    contentDisplay.style.display = "inline-block";


    const highlightCurrentBlockButton = document.createElement("button");
    highlightCurrentBlockButton.innerText = "Highlight again current block";
    highlightCurrentBlockButton.id = "highlightCurrentBlockBtn";
    highlightCurrentBlockButton.style.display = "inline-block";
    highlightCurrentBlockButton.disabled = true;
    highlightCurrentBlockButton.addEventListener("click", highlightCurrentBlock);

    document.body.appendChild(textBox);
    document.body.appendChild(searchButton);
    document.body.appendChild(previousButton);
    document.body.appendChild(nextButton);
    document.body.appendChild(indexContent);
    document.body.appendChild(contentDisplay);
    document.body.appendChild(scaleZOOM);
    document.body.appendChild(highlightCurrentBlockButton);

    document.getElementById("searchTerm").addEventListener('keydown', function (e) {
        const currentScale = document.querySelector(".blocklyBlockCanvas").getAttribute("transform").match(/scale\(([^\)]+)\)/)[1];
        document.getElementById("scaleZOOM").innerText = "(Current Zoom: " + parseFloat(currentScale).toFixed(2) + ")";
        // if (e.altKey || e.ctrlKey || e.shiftKey) {

        if (e.key == "Enter" && document.getElementById("searchTerm").value != "") {
            searchMatchingElements();
        }

        if (e.ctrlKey && e.key == "f" || e.ctrlKey && e.key == "F") {
            console.log("violent ctrl + f")
            document.getElementById("searchTerm").focus()

        }
    });


});
