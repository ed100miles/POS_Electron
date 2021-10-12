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

#TODO: interpret verbs that can be nouns as verbs

def check_sentence(sentence):
    nouns = set(config['nouns'])
    verbs = set(config['verbs'])
    ignore_words = config['ignore_words']
    ignore_words + [x.capitalize() for x in ignore_words]
    pos_tagged = nltk.pos_tag(nltk.word_tokenize(sentence))
    pos_list = [x[1] for x in pos_tagged if x[0] not in ignore_words]
    
    if len(nouns & set(pos_list)) > 0 and len(verbs & set(pos_list)) > 0:
        print('Good Mission!')
        good_missions.append(f'{sentence}\n{pos_tagged}\n\n')
    else:
        print('Bad Mission')
        bad_missions.append(f'{sentence}\n{pos_tagged}\n\n')
check_sentence(sent)
