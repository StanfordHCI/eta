import argparse
import csv
import matplotlib.pyplot as plt
import numpy as np
from pylab import rcParams
from scipy.optimize import curve_fit
rcParams['figure.figsize']=8,5
def load_answers(keys,filename):
 answers={}
 for k in keys:
  answers[k]={}
 with open(filename)as f:
  reader=csv.DictReader(f)
  for row in reader:
   for k in keys:
    answers[k][row['ID']]=row[k]
 return answers
def load_turk(keys,filename):
 attempts={}
 for k in keys:
  attempts[k]={}
 with open(filename)as f:
  reader=csv.DictReader(f)
  for row in reader:
   time_limits=dict(zip(row['Answer.order'].split("|"),row['Answer.time_limits'].split("|")))
   practice_ids=row['Answer.practice_ids'].split("|")
   for k in keys:
    times={}
    i=1
    while "Answer.q%d_eid"%i in row:
     if "q%d_box"%i not in practice_ids:
      time_limit=time_limits["q%d_box"%i]
      if "Answer.q%d_%s"%(i,k.lower())in row:
       ans=row["Answer.q%d_%s"%(i,k.lower())]
      else:
       ans=None
      times.setdefault(time_limit,[]).append((row["Answer.q%d_eid"%i],ans))
     i+=1
    for t,v in times.iteritems():
     attempts[k].setdefault(t,[]).append(v)
 return attempts
def check_answers(answers,attempts):
 vals={}
 for k,v in attempts.iteritems():
  vals[k]={}
  for t,users in v.iteritems():
   num_correct=0
   for user in users:
    for i,v3 in user:
     if v3.strip()==answers[k][i].strip():
      num_correct+=1
    vals[k].setdefault(t,[]).append((num_correct,len(user)))
 return vals
def generate_xy(scores):
 xys={}
 for k,v in scores.iteritems():
  xy=[]
  for t,v2 in v.iteritems():
   t=float(t)/1000
   if t!=-1:
    s_sum=0.0
    for num_correct,total in v2:
     s_sum+=(total-num_correct-0.0)/total
    xy.append((t,s_sum/len(v2)))
  xy=sorted(xy)
  xys[k]=map(list,zip(*xy))
 return xys
def logit_func(x,a,b,c):
 return a/(1.0+np.exp(-(b*(x-c)))) 
def gen_eta(xys,out_dir):
 xdata,ydata=xys
 ymin,ymax=min(ydata),max(ydata)
 try:
  ydata=[(y-ymin-0.0)/(ymax-ymin)for y in ydata]
 except:
  print "\tWarning: error rate is constant for all observed times"
 with open('%seta.csv'%out_dir,'w')as f:
  f.write("time_taken,error_rate\n")
  for x,y in zip(xdata,ydata):
   f.write('%f,%f\n'%(x,y))
 plt.plot(xdata,ydata,'rx',label="Observed")
 xdata.append(0.0)
 ydata.append(1.0)
 xdata.append(-1.0)
 ydata.append(1.0)
 eta_val=0
 time_10=0
 popt=[0,0,0]
 try:
  popt,pcov=curve_fit(logit_func,xdata,ydata,p0=(1,-3,2))
  xfit=np.linspace(0,max(xdata),1000)
  yfit=[min(y,1.0)for y in logit_func(xfit,*popt)]
  eta_val=np.trapz(yfit,xfit)
  time_10=min([x for x,y in zip(xfit,yfit)if y<=0.1])
  plt.plot(xfit,yfit,'k-',label="Fitted")
 except:
  print "\tWarning: unable to fit a curve to the data"
 plt.ylabel('Error Rate')
 plt.xlabel('Time Taken (s)')
 plt.axis((0,max(xdata),0,1))
 plt.grid()
 plt.legend(frameon=False)
 plt.title("ETA = %.2f"%eta_val)
 plt.savefig('%seta.png'%out_dir)
 with open('%seta.txt'%out_dir,'w')as f:
  f.write("ETA: %.2f\n"%eta_val)
  f.write("Time@10: %.2f\n"%time_10)
  c_term=popt[2]
  if c_term>0:
   c_term=" - %.2f"%c_term
  else:
   c_term=" + %.2f"%c_term*-1.0
  f.write("Fitted Curve: y = %.2f / ( 1 + exp(%.2f * (x%s)) )"%(popt[0],popt[1]*-1.0,c_term))
if __name__=='__main__':
 parser=argparse.ArgumentParser(description='Generate ETA for a task.')
 parser.add_argument('--data_file',help="Task Data File",default="./data.csv")
 parser.add_argument('--turk_file',help="Mechanical Turk Batch Results File",default="./results.csv")
 parser.add_argument('--key',help="Answer Column Name(s)",default="ANSWER")
 parser.add_argument('--out_dir',help="Output Directory",default="./")
 args=parser.parse_args()
 data_file=args.data_file
 turk_file=args.turk_file
 keys=args.key.split(",")
 out_dir=args.out_dir
 print "(1/4) Loading Data File from %s..."%data_file
 answers=load_answers(keys,data_file)
 print "(2/4) Loading Worker Answers from %s..."%turk_file
 attempts=load_turk(keys,turk_file)
 print "(3/4) Checking Worker Answers..."
 scores=check_answers(answers,attempts)
 print "(4/4) Generating plots and ETA..."
 xys=generate_xy(scores)
 if len(xys)>1:
  for k,xy in xys.iteritems():
   gen_eta(xy,out_dir+k+"_")
 else:
  for k,xy in xys.iteritems():
   gen_eta(xy,out_dir)
 print "Done!"
# Created by pyminifier (https://github.com/liftoff/pyminifier)

