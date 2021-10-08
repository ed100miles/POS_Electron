import nltk
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger') 


path_to_missions = input()
out_folder = ''
# input('Enter the path to the file where you want good and bad missions logged. (eg /Users/Lewis/Documents/):\n')

good_missions = []
bad_missions = []

def check_sentence(sentence):
    nouns = set(['NN', 'NNS', 'NNP', 'NNPS'])
    verbs = set(['VB', 'VGB', 'VBD', 'VBN', 'VBP', 'VBZ'])
    pos_tagged = nltk.pos_tag(nltk.word_tokenize(sentence))
    pos_list = [x[1] for x in pos_tagged]
    
    if len(nouns & set(pos_list)) > 0 and len(verbs & set(pos_list)) > 0:
        good_missions.append(f'{sentence}\n{pos_tagged}\n\n')
    else:
        bad_missions.append(f'{sentence}\n{pos_tagged}\n\n')

with open(path_to_missions, 'r') as in_file:
    for line in in_file.readlines():
        check_sentence(line)

with open(f'{out_folder}good.txt', 'w') as good_out:
    for line in good_missions:
        good_out.write(line)

with open(f'{out_folder}bad.txt', 'w') as bad_out:
    for line in bad_missions:
        bad_out.write(line)

print('All done.')
