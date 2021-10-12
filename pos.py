import nltk
from nltk import tokenize
from nltk.corpus import wordnet as wn
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

def possible_verb(word):
    return 'v' in set(s.pos() for s in wn.synsets(word))

def check_sentence(sentence):
    nouns = set(config['nouns'])
    verbs = set(config['verbs'])
    ignore_words = config['ignore_words']
    check_ambiguous_verb_nouns = config['ambig_nouns']
    ignore_words + [x.capitalize() for x in ignore_words]
    tokenized = nltk.word_tokenize(sentence)
    # If config specifies, check to see if sentence contains any
    # nouns that can also be a verb (end, dance, cut, dress, etc)
    noun_could_be_verb = False
    if check_ambiguous_verb_nouns:
        for word in tokenized:
            if possible_verb(word):
                noun_could_be_verb = True
                # if we're interpreting word as a verb,  
                # don't allow to also be a noun
                ignore_words.append(word)
    pos_tagged = nltk.pos_tag(tokenized)
    pos_list = [x[1] for x in pos_tagged if x[0] not in ignore_words]
    if (len(nouns & set(pos_list)) > 0 
        and len(verbs & set(pos_list)) > 0 or noun_could_be_verb):
        print('Good Mission!')
        good_missions.append(f'{sentence}\n{pos_tagged}\n\n')
    else:
        print('Bad Mission')
        bad_missions.append(f'{sentence}\n{pos_tagged}\n\n')
check_sentence(sent)
