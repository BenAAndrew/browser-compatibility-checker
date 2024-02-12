// Following should be OK
const finite = isFinite(1000 / x);
const x = parseFloat("55.5");

// Following should have issues
const encoder = new VideoEncoder({});
const error = new InternalError();
