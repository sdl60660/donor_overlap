
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


let overlapThresholdNewtork = 33;
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


// Down arrow scroll trigger
function setScrollArrow() {
    $(".downArrow").on("click", function() {
        // If mobile, arrow will be with them the whole time
        // if (phoneBrowsing === true) {

            // // If first scroll from intro block
            // if ($(window).scrollTop() < window.innerHeight) {
            //     $('html, body').animate({scrollTop: $('#sunburst-wrapper').offset().top }, 'slow');
            // }
            // // If at joint between sunburst/flowchart, be specific
            // else if ($("#last-sunburst-annotation").css("opacity") === "1") {
            //     $('html, body').animate({scrollTop: $('#flowchart-wrapper').offset().top }, 'slow');
            // }
            // // If at joint between flowchart and conclusion, be specific
            // else if ($("#last-flowchart-annotation").css("opacity") === "1") {
            //     $('html, body').animate({scrollTop: $('#end-text-block').offset().top - 100 }, 'slow');
            // }
            // else {
            //     $('html, body').animate({scrollTop: `+=${$(".mobile-spacer").css("height")}`}, 'fast');
            // }

            // scrollSpeed = 'fast';
        // }

        // If on Desktop, arrow stays at the top and only needs this one trigger
        // else {
            $('html, body').animate({scrollTop: $('#first-annotation').offset().top + 150}, 'slow');
        // }
    });

    // If on mobile, the down arrow is fixed at the bottom of the screen and can be used to move from section to section the whole time
    // It should also be a little larger and re-centered
    if (phoneBrowsing === true) {
        $(".downArrow img")
            .attr("width", "70px")
            .attr("height", "70px");

        // $(".downArrow")
        //     .css("text-align", "center")
        //     .css("position", "fixed")
        //     .css("left", `calc(50% - 35px)`);
    }
}



// Window re-size/scroll functions
function setWindowFunctions() {
    $(window)
        .resize(function () {
            // If window is re-sized to above/below mobile cutoff, refresh the page
            if ((phoneBrowsing === true && window.innerWidth > phoneBrowsingCutoff)
                || (phoneBrowsing === false && window.innerWidth < phoneBrowsingCutoff)) {

                this.location.reload(false);
            }

        })
        // Hide the scroll arrow if the user passes a certain scroll height (past the top of the sunburst on Desktop,
        // a little before the end text on mobile)
        .scroll(function () {
            let arrowFadeHeight = (phoneBrowsing === true) ?
                $('#end-text-block').offset().top - 110 :
                $('#sunburst-wrapper').offset().top;

            if ($(window).scrollTop() > arrowFadeHeight) {
                $(".downArrow")
                    .css("opacity", 0.0);
                // .fadeTo( "fast" , 0);
            }
            else {
                $(".downArrow")
                    .css("opacity", 1.0);
                // .fadeTo( "fast" , 1);
            }
        });
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

        overlapThresholdNewtork = range.value;
        networkChart.wrangleData();

        updateSliderLabel("min-overlap-network", overlapThresholdNewtork);
    });


    $("#min-donor-threshold-network").on('input', () => {
        const range = document.getElementById('min-donor-threshold-network');

        minDonorCountNetwork = range.value;
        networkChart.wrangleData();

        updateSliderLabel("min-donor-threshold-network", minDonorCountNetwork);
    });

    updateSliderLabel("min-overlap-threshold", overlapThreshold);
    updateSliderLabel("min-overlap-network", overlapThresholdNewtork);
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
    setScrollArrow();
    // setWindowFunctions();
    
    Promise.all(promises).then(function(allData) {

        overlapLinks = allData[0];
        overlapNodes = allData[1];
        candidateIdNames = allData[2];

        overlapLinks.forEach(link => {
            link.pct_val = +link.pct_val;
            link.raw_val = +link.raw_val;
        });

        $(".loadring-container")
            .hide();

        $("#intro-wrapper, #nodelink-wrapper, #network-wrapper, .footer")
            .css("visibility", "visible");

        initSliders();
        buildCandidateDropdowns();
        nodeLink = new NodeLink("#nodelink-area");
        networkChart = new NetworkChart("#network-area")

    });
}

main();






