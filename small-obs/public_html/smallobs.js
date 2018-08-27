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
            var cmbSize = document.getElementById('optionsSize');
            if (cmbSize !== null) {
                obsSize = cmbSize.value;
            }
            var cmbMode = document.getElementById('optionsMode');
            if (cmbMode !== null && cmbMode.value === 'dynamic') {
                generateDynamicWidget(observationID);
            }
            else {
                generateStaticWidget(observationID);
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
    
    function generateDynamicWidget(observationID) {
        var htmlTemplate;
        var reader = new XMLHttpRequest();
        reader.open("GET", "./shareobs.html?obs=" + observationID, false); 
        reader.onreadystatechange = function () {
            if (reader.readyState == 4) {
                htmlTemplate = reader.responseText;
            }
        };
        reader.send(null);
        var widgetHTML = document.getElementById('widgetHTML');
        if (widgetHTML !== null) {
            var currentURL = window.location.href;
            var dynamicURL = currentURL.substr(0, currentURL.lastIndexOf('/') + 1) + "shareobs.html?obs=" + observationID + "&size=" + obsSize;
            var width = 500;
            var height = 130;
            if (obsSize === 'medium') {
                width = width * 1.5;
                height = height * 2;
            }
            document.getElementById('widget').innerHTML = "<iframe src='" + dynamicURL + "' frameBorder='0' " 
                    + "width='" + width + "' height='" + height + "'></iframe>";
            widgetHTML.textContent = "<iframe src='" + dynamicURL + "' frameBorder='0' "
                    + "width='" + width + "' height='" + height + "'></iframe>";
        }
    }
    
    function generateStaticWidget(observationID) {
        // Get the observation
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Read the HTML template
                var htmlTemplate;
                var reader = new XMLHttpRequest();
                reader.open("GET", "./smallobs.html", false); 
                reader.onreadystatechange = function () {
                    if (reader.readyState == 4) {
                        htmlTemplate = reader.responseText;
                    }
                };
                reader.send(null);
                // Determine the observation specific variables
                try {
                    var obsData = JSON.parse(this.responseText).results[0];
                    if (obsSize === 'small') {
                        htmlTemplate = htmlTemplate.replace('{img_src}', obsData.photos[0].url);
                    }
                    else
                    if (obsSize === 'medium') {
                        htmlTemplate = htmlTemplate.replace('{img_src}', obsData.photos[0].url.replace('square', 'small'));
                        htmlTemplate = htmlTemplate.replace('font-size: large;', 'font-size: xx-large;');
                        htmlTemplate = htmlTemplate.replace('font-size: small;', 'font-size: large;');
                    }
                    htmlTemplate = htmlTemplate.replace('{img_href}', obsData.uri);
                    htmlTemplate = htmlTemplate.replace('{obs_href}', obsData.uri);
                    if (obsData.species_guess) {
                        htmlTemplate = htmlTemplate.replace('{title}', obsData.species_guess);
                    }
                    else {
                        htmlTemplate = htmlTemplate.replace('{title}', 'unknown');
                    }
                    htmlTemplate = htmlTemplate.replace('{date}', obsData.observed_on);
                    htmlTemplate = htmlTemplate.replace('{username}', obsData.user.name);
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

    // If a URL parameter was present then handle it immediately
    var url = new URL(window.location.href);
    var obsSize = url.searchParams.get('size');
    if (obsSize) {
        console.log('URL obsSize found: ' + obsSize);
    }
    var obsID = url.searchParams.get('obs');
    if (obsID) {
        console.log('URL obsID found: ' + obsID);
        var txtObs = document.getElementById('observation');
        if (txtObs !== null) {
            txtObs.value = obsID;
        }
        setTimeout(doGenerateClick, 0);
    }
