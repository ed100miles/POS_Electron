import nltk
import json
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger') 


path_to_missions = input()
out_folder = ''
# input('Enter the path to the file where you want good and bad missions logged. (eg /Users/Lewis/Documents/):\n')

with open('pos_config.json', 'r') as config_file:
    config = json.load(config_file)

good_missions = []
bad_missions = []

#TODO: interpret verbs that can be nouns as verbs

def check_sentence(sentence):
    nouns = set(config['nouns'])
    verbs = set(config['verbs'])
    ignore_words = config['ignore_words']
    ignore_words + [x.capitalize() for x in ignore_words]
    save_pos_tags = config['save_pos_tags']
    pos_tagged = nltk.pos_tag(nltk.word_tokenize(sentence))
    # build a list of pos tags from given sentence,
    # unless a word in the sentence is in the ignore_words list
    pos_list = [x[1] for x in pos_tagged if x[0] not in ignore_words]
    
    if len(nouns & set(pos_list)) > 0 and len(verbs & set(pos_list)) > 0:
        if save_pos_tags:
            good_missions.append(f'{sentence}\n{pos_tagged}\n\n')
        else:
            good_missions.append(f'{sentence}\n\n')
    else:
        if save_pos_tags:
            bad_missions.append(f'{sentence}\n{pos_tagged}\n\n')
        else:
            bad_missions.append(f'{sentence}\n\n')

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
