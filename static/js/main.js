
// ======== GLOBALS ======== //
let phoneBrowsing = false;

// Min width that browser window must be before switching to phoneBrowsing mode (even on Desktop, it will display everything as if on Mobile)
const phoneBrowsingCutoff = 1100;

// Datasets
let overlapNodes = null;
let overlapLinks = null;
let candidateIdNames = null;

let overlapThreshold = 8;
let featuredCandidateId = "H8NY15148";


let overlapThresholdNetwork = 33;
let minDonorCountNetwork = 30000;

const partyColor = d3.scaleOrdinal()
        .domain(['DEM', 'DFL', 'REP', 'LIB', 'GRE', 'IND'])
        .range(["#0015BC", "#0015BC", "#E9141D", "#FED105", "#508C1B", "gray"])
        .unknown("gray");


// ======== END GLOBALS ======== //

// Determine whether to enter phoneBrowsing mode based on browser window width or browser type (uses phoneBrowsingCutoff as threshold of window width)
// Then, execute a lot of code/formatting that depends on whether the user is on Mobile or Desktop
function determinePhoneBrowsing() {
    // Determine if the user is browsing on mobile based on browser window width or browser type
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < phoneBrowsingCutoff) {
        phoneBrowsing = true;
    }

    //
    if (phoneBrowsing === true) {
        $(".step")
            .css("font-size", "18pt");

        $(".step .body")
            .css("font-size", "18pt");
    }

    // On mobile, fade non-current annotation slides to 0, because they are all fixed at the top and overlapping
    // On desktop keep them visible, but low opacity
    if (phoneBrowsing === true) {
        hiddenOpacity = 0.0;
    }
    else {
        hiddenOpacity = 0.2;
    }

    // If mobile, and annotations are up top, adjust top-padding on viz-tiles to make room for fixed-position annotation
    if (phoneBrowsing === true) {
        // setDynamicPadding('#sunburst-tile', 1, 7);       // Keep this, but populate with correct element ID and indices
        // setDynamicPadding('#flowchart-tile', 8, 13);     // Keep this, but populate with correct element ID and indices
    }
}


// Initialize timeline slider
function initSliders() {

    const updateSliderLabel = (sliderID, sliderVal) => {
        const range = document.getElementById(sliderID);
        const rangeLabel = document.getElementById(`${sliderID}-slider-label`);

        if (sliderID === "min-donor-threshold-network") {
            rangeLabel.innerHTML = `<span>${d3.format(",")(sliderVal)}</span>`;
        }
        else {
            rangeLabel.innerHTML = `<span>${sliderVal}%</span>`;
        }

        const newVal = Number(((sliderVal - range.min) * 100) / (range.max - range.min));
        rangeLabel.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
    };

    $("#min-overlap-threshold").on('input', () => {
        const range = document.getElementById('min-overlap-threshold');

        overlapThreshold = range.value;
        nodeLink.wrangleData();

        updateSliderLabel("min-overlap-threshold", overlapThreshold);
    });

    $("#min-overlap-network").on('input', () => {
        const range = document.getElementById('min-overlap-network');

        overlapThresholdNetwork = range.value;
        networkChart.wrangleData();

        updateSliderLabel("min-overlap-network", overlapThresholdNetwork);
    });


    $("#min-donor-threshold-network").on('input', () => {
        const range = document.getElementById('min-donor-threshold-network');

        minDonorCountNetwork = range.value;
        networkChart.wrangleData();

        updateSliderLabel("min-donor-threshold-network", minDonorCountNetwork);
    });

    updateSliderLabel("min-overlap-threshold", overlapThreshold);
    updateSliderLabel("min-overlap-network", overlapThresholdNetwork);
    updateSliderLabel("min-donor-threshold-network", minDonorCountNetwork);
}

function buildCandidateDropdowns() {

    let htmlString = "";
    overlapNodes.forEach(d => {
        htmlString += `<option class="candidate-option" id="candidate-${d.id}" value="${d.id}">${d.display_name}</option>`;
    });

    $('#overlap-nodelink-candidate-select').append(htmlString);
    $("#overlap-nodelink-candidate-select").val(featuredCandidateId);
    document.querySelector("#overlap-nodelink-candidate-select").fstdropdown.rebind();

    $("#overlap-nodelink-candidate-select")
        .on("change", () => {
            featuredCandidateId = $("#overlap-nodelink-candidate-select").val();
            nodeLink.wrangleData();
        })

}


function main() {

    // Begin loading datafiles
    const promises = [
        d3.csv("static/data/candidate_overlap_links.csv"),
        d3.csv("static/data/candidate_overlap_nodes.csv"),
        d3.json("static/data/candidate_id_name_lookup.json")
    ];

    // Initialize both main viz tiles to faded
    // $("#sunburst-tile")
    //     .css("opacity", 0.2);

    // $("#flowchart-tile")
    //     .css("opacity", 0.2);

    determinePhoneBrowsing();
    
    Promise.all(promises).then(function(allData) {

        overlapLinks = allData[0];
        overlapNodes = allData[1];
        candidateIdNames = allData[2];

        networkLinks = _.cloneDeep(overlapLinks);
        networkNodes = _.cloneDeep(overlapNodes);

        overlapLinks.forEach(link => {
            link.pct_val = +link.pct_val;
            link.raw_val = +link.raw_val;
        });

        // networkLinks.forEach(link => {
        //     link.pct_val = +link.pct_val;
        //     link.raw_val = +link.raw_val;
        // })

        $(".loadring-container")
            .hide();

        $("#intro-wrapper, #nodelink-wrapper, #network-wrapper, .footer")
            .css("visibility", "visible");

        networkChart = new NetworkChart("#network-area");

        initSliders();
        buildCandidateDropdowns();
        nodeLink = new NodeLink("#nodelink-area");

    });
}

main();






