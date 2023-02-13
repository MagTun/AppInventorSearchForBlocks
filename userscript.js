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
    let elementsWithTerm = [];

    let tempHighlightListID=  []
    function searchElement() {


        const searchTerm = document.getElementById("searchTerm").value;
        const injectionDiv = document.querySelector(".blocklyWorkspace"); //injectionDiv
        const blocklyTextElements = injectionDiv.querySelectorAll(".blocklyText");
        currentIndex = 0;
        elementsWithTerm = [];

        for (const blocklyText of blocklyTextElements) {
            if (blocklyText.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                elementsWithTerm.push(blocklyText);
            }
        }

        displayContent();
    }

    function displayContent() {


            // # .... * remove previous highlight
      console.log(tempHighlightListID)
            for (const id of tempHighlightListID) {
                try {
                    var element = document.getElementById(id);
                    element.parentNode.removeChild(element);

                } catch (error) {

                }
            }

            tempHighlightListID=[]



        // # .... * set the content of search buttons/span
        const lengtElementsWithTerm = elementsWithTerm.length

        if (lengtElementsWithTerm > 1) { // if more than 1 item
                document.getElementById("indexContent").innerText = currentIndex + "/" + (lengtElementsWithTerm -1)
            if (currentIndex > 0) {
                document.getElementById("previousContent").style.display = "inline-block";
            } else {
                document.getElementById("previousContent").style.display = "none";
            }

            if (currentIndex < lengtElementsWithTerm - 1) {
                document.getElementById("nextContent").style.display = "inline-block";
            } else {
                document.getElementById("nextContent").style.display = "none";
            }
        }

        // # .... * find the element and
        // prepare the var needed
        const contentDisplay = document.getElementById("contentDisplay");
        const currentElement = elementsWithTerm[currentIndex];

        if (currentElement) {
            var numberParent = 0;
            var currentNode = currentElement.parentNode;
            var pathString = returnPath(currentNode, 0.3)
            var pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathElement.setAttribute("d", pathString);
            pathElement.setAttribute("fill", "red");
            pathElement.setAttribute("opacity", "0.6");
            const idtempHighlightA = "tempHighlight"+ Math.random().toString(36).substring(7);
            tempHighlightListID.push(idtempHighlightA)
            pathElement.setAttribute("id", idtempHighlightA);

            currentNode.appendChild(pathElement);


            setTimeout(() => {
                try {
                    var element = document.getElementById(idtempHighlightA);
                    element.parentNode.removeChild(element);
                    idtempHighlightB.splice(idtempHighlightB.indexOf(idtempHighlightA), 1);
                } catch (error) {

                }

            }, 10000);



         //  find the first parent of the element whose parent is blocklyBlockCanvas
            while (currentNode && !currentNode.classList.contains("blocklyBlockCanvas")) {
                console.log(currentNode);
                if (currentNode.parentNode.classList.contains("blocklyBlockCanvas")) {
                    console.log("blocklyBlockCanvas")
                break;
            }
                else {
                    numberParent += 1;
                    currentNode = currentNode.parentNode;
                }
            }



            if (currentNode) {
                // The first parent with the class "blocklyDraggable" was found
                var pathString = returnPath(currentNode, 0.1)
                var pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathElement.setAttribute("d", pathString);
                pathElement.setAttribute("fill", "yellow");
                pathElement.setAttribute("opacity", "0.3");
                const idtempHighlightB = "tempHighlight"+ Math.random().toString(36).substring(7);
                tempHighlightListID.push(idtempHighlightB)
                pathElement.setAttribute("id",idtempHighlightB);

                currentNode.appendChild(pathElement);


                setTimeout(() => {
                    try {
                        var element = document.getElementById(idtempHighlightB);
                        element.parentNode.removeChild(element);
                        idtempHighlightB.splice(idtempHighlightB.indexOf(idtempHighlightB), 1);


                    } catch (error) {

                    }
                }, 10000);

                var translate1, translate2;

                // if (number == 0) {
                var currentNodeTransform = currentNode.getAttribute("transform");

                [translate1, translate2] = currentNodeTransform.match(/[-]?\d+(\.\d+)?/g).map(num => -1 * parseFloat(num));
                console.log(currentElement.textContent, "  ", currentNodeTransform, "   ", translate1, "   ", translate2)


                //  document.querySelector(".blocklyBlockCanvas").getAttribute("transform")    //
                //   document.querySelector(".blocklyBlockCanvas").setAttribute("transform", 'translate(110,-110) scale(1)')
                const currentScale = document.querySelector(".blocklyBlockCanvas").getAttribute("transform").match(/scale\(([^\)]+)\)/)[1];
                const blocklyBlockCanvas = document.querySelector(".blocklyBlockCanvas");
                blocklyBlockCanvas.setAttribute("transform", `translate(${translate1}, ${translate2}) scale(${currentScale})`);

                const blocklyBubbleCanvas = document.querySelector(".blocklyBubbleCanvas");
                blocklyBubbleCanvas.setAttribute("transform", `translate(${translate1}, ${translate2}) scale(${currentScale})`);

                contentDisplay.innerText = currentElement.textContent + " (parent: " + numberParent + ")"

            } else {
                contentDisplay.innerText = "No element found"
            }

        } else {
            contentDisplay.innerText = "No element found"

        }
    }

    function previousContent() {
        if (currentIndex > 0) {
            currentIndex--;
            displayContent();
        }
    }

    function nextContent() {
        if (currentIndex < elementsWithTerm.length - 1) {
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

    const textBox = document.createElement("input");
    textBox.type = "text";
    textBox.id = "searchTerm";

    const scaleZOOM = document.createElement("span");
    scaleZOOM.id = "scaleZOOM";
    scaleZOOM.style.display = "inline-block";

    const searchButton = document.createElement("button");
    searchButton.innerText = "Search";
    searchButton.addEventListener("click", searchElement);

    const indexContent = document.createElement("span");
    indexContent.id = "indexContent";
    indexContent.style.display = "inline-block";

    const previousButton = document.createElement("button");
    previousButton.innerText = "←";
    previousButton.id = "previousContent";
    previousButton.style.display = "none";
    previousButton.addEventListener("click", previousContent);


    const nextButton = document.createElement("button");
    nextButton.innerText = "→";
    nextButton.id = "nextContent";
    nextButton.style.display = "none";
    nextButton.addEventListener("click", nextContent);

    const contentDisplay = document.createElement("div");
    contentDisplay.id = "contentDisplay";
    contentDisplay.style.display = "inline-block";

    document.body.appendChild(textBox);
    document.body.appendChild(searchButton);
    document.body.appendChild(indexContent);
    document.body.appendChild(previousButton);
    document.body.appendChild(nextButton);
    document.body.appendChild(contentDisplay);
   document.body.appendChild(scaleZOOM);

    document.getElementById("searchTerm").addEventListener('keydown', function (e) {
       const currentScale = document.querySelector(".blocklyBlockCanvas").getAttribute("transform").match(/scale\(([^\)]+)\)/)[1];
       document.getElementById("scaleZOOM").innerText= "(Current Zoom: "+ parseFloat(currentScale).toFixed(2)+ ")";
        // if (e.altKey || e.ctrlKey || e.shiftKey) {

        if (e.key == "Enter" && document.getElementById("searchTerm").value!="" ) {
            searchElement();
        }
    });


});
