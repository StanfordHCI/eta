ETA Framework
=============

The ETA framework is a Javascript library that you can use to compute the difficulty of an Amazon Mechanical Turk task. It computes the error-time curve and error-time area under the curve (ETA) for the task.

This framework is based on the methodology described in [this paper](http://hci.stanford.edu/publications/2015/eta/eta.pdf
).

Demo
----
See a [demonstration](https://files.clr3.com/eta/examples/multiple-choice_demo.html) of the interface ETA generates to evaluate the difficulty of a task.

By running this task on Mechanical Turk, the ETA framework can generate an error-time curve, and compute the ETA for a task:

![ETA](https://files.clr3.com/eta/web/eta.png)

More examples of such curves can be found in [the paper](http://hci.stanford.edu/publications/2015/eta/eta.pdf).

Requirements
------------
* [Python, numpy, scipy, and matplotlib](http://www.scipy.org/install.html)

Getting Started
---------------
The key idea behind ETA is to limit the amount of time workers have to complete a task, and measure worker accuracy given different time limits. Thus, given any task, we ask a worker to complete the same task multiple times (with different data) under different time limits, and observe how the worker's accuracy changes.

In this tutorial, we'll look at the `multiple_choice_remote` example in the `examples` folder. This task is a multiple-choice question, where the goal is to pick the label that best describes an image.

### Task File Preparation

First, let's look at `mturk.html`. Every task is essentially composed of a task template, and task options.

For instance, here's a simplified version of this task's template:

    <div class="base_q">
      <div><img src="#IMG_URL#"></div>
      <div>
        Pick a label that best applies to this image.
        <label><input type="radio" name="answer" value="#LABEL1#"> #LABEL1#</label>
        <label><input type="radio" name="answer" value="#LABEL2#"> #LABEL2#</label>
        <label><input type="radio" name="answer" value="#LABEL3#"> #LABEL3#</label>
        <label><input type="radio" name="answer" value="#LABEL4#"> #LABEL4#</label>
      </div>
    </div>

The task options for this task are also defined in `mturk.html`:

    var question_metadata = {
        time_limits: [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0],  # Possible time limits
        num_reps: [3, 3, 3, 3, 3, 3, 3],                   # Number of repetitions for each time limit
        practice_time_limit: 8,                            # Time limit for the practice questions
        practice_num_reps: 3                               # Number of Practice Questions
      };

Here, I'm guessing that people may take anywhere from 0.5 to 5 seconds to complete this task, so I've defined seven time limits in that range. In practice, you'll want at least seven unique time limits to generate a reliable error-time curve.

### Data Preparation

You'll also need data to populate the HTML template above. Here, `data.csv` is identical to a data file that you might upload to Mechanical Turk for a regular task, only now you provide it directly to the ETA framework.

    IMG_URL,LABEL1,LABEL2,LABEL3,LABEL4,ANSWER
    http://...png,jumping,waving,climbing,brushing,waving
    http://...png,eating,cooking,waving,jumping,jumping
    ...

Note that the columns in the CSV file correspond to the variables defined in the template (e.g., "IMGURL" and "LABEL1"). The correct answer for a question defined in the "ANSWER" column, while the input name in the template is correspondingly "answer".

To generate a JSON file so that ETA can parse this data, you can run `python generate_json.py` in the example directory, which will generate the `data.json` file. `generate_json.py` strips the answer columns so that workers aren't able to inspect the HTML to see the correct answers to the questions.

In this example, data is remotely served using `get.php`, so that we don't need to directly include the data in the task file. However, you can also directly include data in the task file (see the `multiple_choice` example instead).

### Running the ETA framework on Mechanical Turk

Now, we simply copy the code in `mturk.html` and paste as source into a Mechanical Turk task:

![Pasting code into Mechanical Turk](https://files.clr3.com/eta/web/mturk1.png)

We then run this task, and finally download the output CSV from Mechanical Turk (`results.csv`).

### Generating the ETA of the task

Finally, we can run `python process.py` in the example directory to obtain the error-time curve and ETA for the task (See `python process.py -h` for more help). Three files will be generated:

* eta.png - A plot of the generated ETA curve
* eta.csv - The processed data used to generate the curve
* eta.txt - Additional useful information

Examples
--------
The `examples` folder contains sample code for how this library can be used.

* `multiple-choice` - Multiple choice task
* `multiple-choice-remote` - Multiple choice task, with data loaded remotely

Notes
-----
* The latest version of the code is hosted on http://clr3.com for easy inclusion in Mechanical Turk tasks. If you'd like to host your own version, note that your web server must be https-enabled.

Contributing
------------
If you are interested in contributing to the development of ETA, keep reading!

Source files are included in the `src` folder. To build ETA, first run these commands:
    
    brew install node
    npm install clean-css -g
    pip install pyminifier

and then run `./build.sh` from `src`, which will output ETA to the `releases` folder.

License
-------
ETA is released under the [MIT License](http://www.opensource.org/licenses/MIT).
