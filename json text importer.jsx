// Create the UI panel
var window = new Window("palette", "Data Update", undefined);
window.orientation = "column";
window.alignChildren = "fill";

// Add descriptive text
var description = window.add("statictext", undefined, "Select a JSON file to update election data:");
description.alignment = "center";

// Add a group for buttons
var buttonGroup = window.add("group");
buttonGroup.orientation = "row";

// Add 'Update Data' and 'Cancel' buttons
var updateButton = buttonGroup.add("button", undefined, "Update Data");
var cancelButton = buttonGroup.add("button", undefined, "Cancel");

// Function to update After Effects text layers with votes and percentages from a JSON file
updateButton.onClick = function() {
    var jsonFilePath = File.openDialog("Select your JSON data file");

    if (jsonFilePath) {
        var file = new File(jsonFilePath);
        if (file.open("r")) {
            try {
                var content = file.read();
                var data = JSON.parse(content);
                file.close();

                // Layer mapping for candidates
                var layerMapping = {
                    "John Doe": "John",
                    "Jane Smith": "Jane",
                    "Alice Johnson": "Alice",
                    "Bob Brown": "Bob"
                };

                // Loop through all compositions in the project
                for (var i = 1; i <= app.project.numItems; i++) {
                    if (app.project.item(i) instanceof CompItem) {
                        var comp = app.project.item(i);
                        var layers = comp.layers;


                        for (var j = 0; j < data.candidates.length; j++) {
                            var candidate = data.candidates[j];
                            var layerPrefix = layerMapping[candidate.name]; // Get the correct prefix

                            var votesLayer = layers.byName(layerPrefix + "_Votes");
                            var percentageLayer = layers.byName(layerPrefix + "_Percentage");

                            if (votesLayer) votesLayer.text.sourceText.setValue(candidate.votes);
                            if (percentageLayer) percentageLayer.text.sourceText.setValue(candidate.percentage + "%");
                        }

               
                        var validVotesLayer = layers.byName("Valid_Votes");
                        var rejectedVotesLayer = layers.byName("Rejected_Votes");
                        var totalPolledLayer = layers.byName("Total_Polled");
                        var totalElectorsLayer = layers.byName("Total_Electors");

                        if (validVotesLayer) validVotesLayer.text.sourceText.setValue(data.validVotes);
                        if (rejectedVotesLayer) rejectedVotesLayer.text.sourceText.setValue(data.rejectedVotes);
                        if (totalPolledLayer) totalPolledLayer.text.sourceText.setValue(data.totalPolled);
                        if (totalElectorsLayer) totalElectorsLayer.text.sourceText.setValue(data.totalElectors);
                    }
                }
                alert("Data updated successfully.");
            } catch (e) {
                alert("Error reading or parsing the file. Please check the JSON format.");
            }
        } else {
            alert("Failed to open the file.");
        }
    } else {
        alert("No file selected.");
    }
};

// Add a cancel button functionality
cancelButton.onClick = function() {
    window.close();
};

// Display the UI window
window.center();
window.show();
