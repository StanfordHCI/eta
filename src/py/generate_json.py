import argparse
import csv
import json

def csv_to_json(in_file, out_file, keys):
    rows = []
    print "(1/4) Loading %s..." % data_file
    with open(in_file, 'r') as f:
        for row in csv.DictReader(f):
            for k in keys:
                try:
                    del row[k]
                except KeyError:
                    print "\tKey %s not found..." % k
            rows.append(row)
    print "(2/4) Loaded %d rows..." % len(rows)
    print "(3/4) %d columns to write: %s" % (len(rows[0].keys()), ", ".join(sorted(rows[0].keys())))
    print "(4/4) Writing to %s..." % out_file
    with open(out_file, 'w') as f:
        json.dump(rows, f, separators=(',',':'))
    print "Done!"

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Generate JSON file from a CSV file.')
    parser.add_argument('--data_file', help="Task Data File", default="./data.csv")
    parser.add_argument('--out_file', help="Output JSON File", default="./data.json")
    parser.add_argument('--key', help="Answer Column Name(s)", default="ANSWER")
    args = parser.parse_args()

    data_file = args.data_file
    keys = args.key.split(",")
    out_file = args.out_file

    csv_to_json(data_file, out_file, keys)
