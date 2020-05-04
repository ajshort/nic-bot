export default (req, res) => {
  // Make sure we have a POST reqest.
  if (req.method.toUpperCase() !== 'POST') {
    res.status(400).end();
    return;
  }

  res.status(200).json({
    type: 'message',
    text: 'Thanks, I\'ll post this to the VR Operators channel',
  });
}
