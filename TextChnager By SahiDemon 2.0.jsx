{
    function buildUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Enhanced Text Changer", undefined, {resizeable: true});
        
        var layerList = [];
        var undoStack = [];
        var redoStack = [];

        // Batch update function
        function batchUpdateText(newText) {
            for (var i = 0; i < layerList.length; i++) {
                var layer = layerList[i];
                if (layer && layer instanceof TextLayer) {
                    undoStack.push({
                        layer: layer,
                        oldText: layer.property("Source Text").value.text
                    });
                    layer.property("Source Text").setValue(new TextDocument(newText));
                }
            }
        }

        // Undo/Redo functionality
        function undoChange() {
            if (undoStack.length > 0) {
                var lastChange = undoStack.pop();
                redoStack.push({
                    layer: lastChange.layer,
                    oldText: lastChange.layer.property("Source Text").value.text
                });
                lastChange.layer.property("Source Text").setValue(new TextDocument(lastChange.oldText));
            }
        }

        function redoChange() {
            if (redoStack.length > 0) {
                var lastUndo = redoStack.pop();
                undoStack.push({
                    layer: lastUndo.layer,
                    oldText: lastUndo.layer.property("Source Text").value.text
                });
                lastUndo.layer.property("Source Text").setValue(new TextDocument(lastUndo.oldText));
            }
        }

        // Live text update and preview
        function previewTextChange(newText) {
            if (myPanel.grp.listBox.selection) {
                var selectedIndex = myPanel.grp.listBox.selection.index;
                var layer = layerList[selectedIndex];
                if (layer && layer instanceof TextLayer) {
                    undoStack.push({
                        layer: layer,
                        oldText: layer.property("Source Text").value.text
                    });
                    layer.property("Source Text").setValue(new TextDocument(newText));
                    // Update the layer name in the list to reflect the new text
                    myPanel.grp.listBox.items[selectedIndex].text = layer.name + " - " + newText;
                }
            }
        }

        // UI Layout
        var res = "group { \
            orientation: 'column', alignment: ['fill', 'fill'], \
            header: Group { \
                orientation: 'row', alignment: ['fill', 'top'], \
                title: StaticText { text: 'Enhanced Text Changer by SahiDemon', alignment: ['fill', 'center'], characters: 30 } \
            }, \
            addButton: Button { text: 'Add Selected Layers', alignment: ['fill', 'top'] }, \
            listBox: ListBox { alignment: ['fill', 'fill'], preferredSize: [300, 300] }, \
            inputText: EditText { alignment: ['fill', 'top'], preferredSize: [300, 25] }, \
            delButton: Button { text: 'Delete Selected Layer', alignment: ['fill', 'top'] }, \
            batchButton: Button { text: 'Batch Update Text', alignment: ['fill', 'top'] }, \
            undoButton: Button { text: 'Undo', alignment: ['fill', 'top'] }, \
            redoButton: Button { text: 'Redo', alignment: ['fill', 'top'] }, \
        }";

        myPanel.grp = myPanel.add(res);

        // Add selected text layers to the list
        myPanel.grp.addButton.onClick = function() {
            var comp = app.project.activeItem;
            if (comp && comp instanceof CompItem) {
                var selectedLayers = comp.selectedLayers;
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    if (layer instanceof TextLayer) {
                        layerList.push(layer);
                        myPanel.grp.listBox.add("item", layer.name + " - " + layer.property("Source Text").value.text);
                    }
                }
            } else {
                alert("Please select a composition and text layers.");
            }
        };

        // Delete selected layer from the list
        myPanel.grp.delButton.onClick = function() {
            var selectedIndex = myPanel.grp.listBox.selection ? myPanel.grp.listBox.selection.index : -1;
            if (selectedIndex !== -1) {
                layerList.splice(selectedIndex, 1);
                myPanel.grp.listBox.remove(selectedIndex);
            } else {
                alert("Please select a layer to delete.");
            }
        };

        // Live preview text change and commit update immediately
        myPanel.grp.inputText.onChanging = function() {
            previewTextChange(myPanel.grp.inputText.text);
        };

        // Undo/redo buttons
        myPanel.grp.undoButton.onClick = function() {
            undoChange();
        };

        myPanel.grp.redoButton.onClick = function() {
            redoChange();
        };

        // Batch update button action
        myPanel.grp.batchButton.onClick = function() {
            var newText = myPanel.grp.inputText.text;
            batchUpdateText(newText);
        };

        myPanel.layout.layout(true);
        return myPanel;
    }

    var myScriptPal = buildUI(this);
    if (myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    }
}
