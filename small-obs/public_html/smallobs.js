    function doGenerateClick() {
        var txtObs = document.getElementById('observation');
        var pnlResult = document.getElementById('PanelResult');
        // Get the observation ID to use
        if (txtObs !== null) {
            obsID = txtObs.value;
            if (isNaN(obsID)) {
                obsID = obsID.substr(obsID.lastIndexOf('/') + 1);
            }
        }
        // Validate that we have a good observation ID to use
        if (isNaN(obsID) || obsID === '') {
            console.log("Can't process the provided observation ID: " + obsID);
            if (pnlResult !== null) {
                pnlResult.style.display = 'none';
            }
            return;
        }
        // Generate the widget
        generateWidget(obsID);
        if (pnlResult !== null) {
            pnlResult.style.display = '';
        }
    }

    function generateWidget(observationID) {
        try {
            // Get the observation
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Read the HTML template
                    var htmlTemplate;
                    var reader = new XMLHttpRequest();
                    reader.open("GET", "smallobs.html", false); 
                    reader.onreadystatechange = function () {
                        if (reader.readyState == 4) {
                            htmlTemplate = reader.responseText;
                        }
                    };
                    reader.send(null);
                    // Determine the observation specific variables
                    try {
                        var obsData = JSON.parse(this.responseText).results[0];
                        htmlTemplate = htmlTemplate.replace('{img_src}', obsData.photos[0].url);
                        htmlTemplate = htmlTemplate.replace('{img_href}', obsData.uri);
                        htmlTemplate = htmlTemplate.replace('{obs_href}', obsData.uri);
                        htmlTemplate = htmlTemplate.replace('{title}', obsData.species_guess);
                        htmlTemplate = htmlTemplate.replace('{date}', obsData.observed_on);
                        htmlTemplate = htmlTemplate.replace('{place}', obsData.place_guess);
                        // Show the small observation on the screen
                        document.getElementById('widget').innerHTML = htmlTemplate;
                        var widgetHTML = document.getElementById('widgetHTML');
                        if (widgetHTML !== null) {
                            widgetHTML.textContent = htmlTemplate;
                        }
                    }
                    catch (error) {
                        console.log("ERROR: " + error);
                        var pnlResult = document.getElementById('PanelResult');
                        if (pnlResult !== null) {
                            pnlResult.style.display = 'none';
                        }
                    }
                }
            };
            xhttp.open("GET", 
                        "https://api.inaturalist.org/v1/observations/" + observationID,
                        true);
            xhttp.send();
        }
        catch (error) {
            console.log("ERROR: " + error);
            var pnlResult = document.getElementById('PanelResult');
            if (pnlResult !== null) {
                pnlResult.style.display = 'none';
            }
        }
    }

    // If a URL parameter was present then handle it immediately
    var url = new URL(window.location.href);
    var obsID = url.searchParams.get('obs');
    if (obsID) {
        console.log('URL obsID found: ' + obsID);
        var txtObs = document.getElementById('observation');
        if (txtObs !== null) {
            txtObs.value = obsID;
        }
        setTimeout(doGenerateClick, 0);
    }
