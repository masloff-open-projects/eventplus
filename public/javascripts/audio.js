const synth = new Tone.Synth({
    oscillator : {
        type: 'sine'
    }
});

var feedbackDelay = new Tone.FeedbackDelay('8n',  0.6);
synth.connect(feedbackDelay);
synth.connect(Tone.Master);
feedbackDelay.connect(Tone.Master);