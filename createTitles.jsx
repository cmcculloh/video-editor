var data = require("cut-list.cjs");

var markerCounter = 1;

data.forEach(function (clipInfo) {
	var sequence = app.project.activeSequence;
	var videoTrack = sequence.videoTracks[0];
	var clip;

	clipInfo.timestamps.forEach(function (time) {
		clip = videoTrack.insertClip(clipInfo.video, time.start);
		clip.end = time.end;

		if (time.comments) {
			time.comments.forEach(function (comment) {
				var marker = clip.markers.createMarker(0);
				var shortComment = comment.length > 10 ? comment.substring(0, 10) : comment;
				marker.name = markerCounter + "-" + shortComment;
				marker.comments = comment;
				markerCounter++;
			});
		}
	});

	if (clipInfo.text) {
		var newTitle = sequence.createTitle("Overlay Text");
		var textComponent = newTitle.getTextComponent();
		textComponent.setText(clipInfo.text);
		textComponent.setFont("Myriad Pro");
		textComponent.setFontSize(132);
		videoTrack.insertClip(newTitle, clipInfo.timestamps[0].start);
	}
});
