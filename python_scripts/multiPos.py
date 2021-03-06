import nltk
from nltk.corpus import wordnet as wn
import contractions
import json
from spellchecker import SpellChecker
from pathlib import Path

path_to_missions, config_path = input().split(',')

out_folder = str(Path.home() / "Downloads")

good_missions = {}
bad_missions = {}


def expand_contractions(sentence):
    return ' '.join(contractions.fix(word) for word in sentence.split())


def correct_spelling(sentence):
    spell = SpellChecker()
    return ' '.join([spell.correction(word) for word in sentence.split()])


def possible_verb(word):
    return 'v' in set(s.pos() for s in wn.synsets(word))


def make_i_upper(sentence):
    sentence_list = [word for word in sentence.split()]
    for index, word in enumerate(sentence_list):
        if word == 'i':
            sentence_list[index] = 'I'
    return ' '.join(sentence_list)


def check_sentence(sentence):
    """"""
    # Get config settings
    with open(config_path, 'r') as config_file:
        config = json.load(config_file)
    nouns: list = set(config['nouns'])
    verbs: list = set(config['verbs'])
    ignore_words: list = config['ignore_words']
    # If config specifies, convert lone 'i' to 'I'
    if config['capitalize_i']:
        sentence = make_i_upper(sentence)
    # If config specifies, convert contractions eg "I'll" -> 'I will'
    if config['expand_contractions']:
        sentence = expand_contractions(sentence)
    # If config specifies, attempt to correct any misspelled words
    if config['spell_check']:
        sentence = str(correct_spelling(sentence))
    ignore_words + [x.capitalize() for x in ignore_words]
    # Tokenize sentence
    tokenized = nltk.word_tokenize(sentence)
    # If config specifies, check to see if sentence contains any
    # nouns that can also be a verb (end, dance, cut, dress, etc)
    # and count as a verb. TODO: this needs more thought,
    # a single word is sufficient criteria
    noun_could_be_verb = False
    if config['ambig_nouns']:
        for word in tokenized:
            if possible_verb(word):
                noun_could_be_verb = True
    pos_tagged = nltk.pos_tag(tokenized)
    pos_list = [x[1] for x in pos_tagged if x[0] not in ignore_words]

    if (len(nouns & set(pos_list)) > 0 and
            (len(verbs & set(pos_list)) > 0) or noun_could_be_verb):
        if config['save_pos_tags']:
            good_missions[str((len(good_missions)+1))
                          ] = f'{sentence}-->{pos_tagged}'
            # good_missions.append(f'{sentence}\n{pos_tagged}\n\n')
        else:
            good_missions[str((len(good_missions)+1))] = f'{sentence}'
    else:
        if config['save_pos_tags']:
            bad_missions[str((len(bad_missions)+1))
                         ] = f'{sentence}-->{pos_tagged}'
        else:
            bad_missions[str((len(bad_missions)+1))] = f'{sentence}'


# read input and write results to file
with open(path_to_missions, 'r') as in_file:
    for line in in_file.readlines():
        check_sentence(line)

out_dict = json.dumps({"good": good_missions,
                       "bad": bad_missions,
                       "dl_path": str(Path.home() / "Downloads")})

print(out_dict)
