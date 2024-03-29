# Candidate Donor Overlap

Visualization project based on FEC records with a particular focus on candidate donor overlap. Uses a Python for data-processing, a local PostgreSQL database and D3/Javascript on the front-end.

I've joined donor data from the FEC, as well as ProPublica's FEC Itemizer ActBlue/WinRed data (which covers donors who contributed less than $200), then identified unique donors and looked for overlap between candidates. See the notes on the bottom of the site for caveats in methodology and potential sources of error.

Live project lives here: https://donor-overlap.samlearner.com/

## Diagrams

Node-link diagram, showing overlap details for a particular candidate:
![First node-link diagram, showing overlap details for particular candidates](https://github.com/sdl60660/donor_overlap/blob/9300a46d5789ac2470919c3f002e9c8ebbbf8f8e/static/images/display_image.png)

Force-directed graph, showing the big picture. Candidates with links have donor overlap above a threshold. Distance on the graph more-or-less implictly represents donor similarity, forming clusters of candidates:
![Second diagram. A force-directed graph showing the big picture with links between all candidates over a given donor threshold](https://github.com/sdl60660/donor_overlap/blob/cb3f5d4bed8f9857bf1605a666cc65557220f694/static/images/second_diagram_display.png)
