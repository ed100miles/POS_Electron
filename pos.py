import nltk
import json
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger') 

sent = input()

with open('pos_config.json', 'r') as config_file:
    config = json.load(config_file)

good_missions = []
bad_missions = []

def check_sentence(sentence):
    nouns = set(config['nouns'])
    verbs = set(config['verbs'])
    pos_tagged = nltk.pos_tag(nltk.word_tokenize(sentence))
    pos_list = [x[1] for x in pos_tagged]
    
    if len(nouns & set(pos_list)) > 0 and len(verbs & set(pos_list)) > 0:
        print('Good Mission!')
        good_missions.append(f'{sentence}\n{pos_tagged}\n\n')
    else:
        print('Bad Mission')
        bad_missions.append(f'{sentence}\n{pos_tagged}\n\n')


check_sentence(sent)

# with open(path_to_missions, 'r') as in_file:
#     for line in in_file.readlines():
#         check_sentence(line)

# with open(f'{out_folder}/good.txt', 'w') as good_out:
#     for line in good_missions:
#         good_out.write(line)

# with open(f'{out_folder}/bad.txt', 'w') as bad_out:
#     for line in bad_missions:
#         bad_out.write(line)