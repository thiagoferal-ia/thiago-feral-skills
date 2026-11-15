# Test cases

Three cases in the `claude plugin eval` layout (prompt.md, case.yaml, graders/, files/):

- **basic-submission-kit**: a small working HTML5 game (Sky Hop demo, SDK v3 integrated); prepare the whole submission kit.
- **fix-rejected-portrait-video**: the portal refused a 1080x1920 video; rebuild both videos to spec.
- **problem-build-review**: a zipped game full of rule breaks (external ads, store link, Firebase login, sitelock, absolute path, fullscreen button).

Run them with `claude plugin eval . --allow-tools Write,Edit,Bash --scaffold` from the skill folder.

The covers and videos in `fix-rejected-portrait-video/files/store/` are artwork from the game Juice Sort
(© Feral Games), included only so the test has real material. They are not covered by the repository's
MIT license; do not reuse them outside these tests.
