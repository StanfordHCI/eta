ETA Framework
=============

The ETA framework is a Javascript library that you can use to compute the difficulty of an Amazon Mechanical Turk task. It computes the error-time curve and error-time area under the curve (ETA) for the task.

Read more about ETA: http://hci.stanford.edu/publications/paper.php?id=294

Demo
----
See a [demonstration](https://files.clr3.com/eta/examples/multiple-choice_demo.html) of the interface ETA generates to evaluate the difficulty of a task.

Getting Started
---------------
The `examples` folder contains sample code for how this library can be used.

Each example comes with two files: `*_demo.html` can be opened directly in your browser, and the code in `*_mturk.html` can be copied directly into Mechanical Turk as a single HIT.

* `multiple-choice` - Multiple choice task

Contributing
------------
If you are interested in contributing to the development of ETA, keep reading!

Source files are included in the `src` folder. To build ETA, first run these commands:
	
	brew install node
	npm install clean-css -g

and then run `./build.sh` from `src`, which will output ETA to the `releases` folder.
