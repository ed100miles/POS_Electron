import nltk
from nltk.corpus import wordnet as wn
import contractions
import json
from spellchecker import SpellChecker


nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')


path_to_missions = input()
out_folder = ''


good_missions = []
bad_missions = []


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
    with open('./configs/pos_config.json', 'r') as config_file:
        config = json.load(config_file)
    nouns: list = set(config['nouns'])
    verbs: list = set(config['verbs'])
    ignore_words: list = config['ignore_words']
    check_ambiguous_verb_nouns: bool = config['ambig_nouns']
    fix_spelling: bool = config['spell_check']
    expand_conts: bool = config['capitalize_i']
    upper_case_i: bool = config['expand_contractions']
    save_pos_tags: bool = config['save_pos_tags']
    # If config specifies, convert lone 'i' to 'I'
    if upper_case_i:
        sentence = make_i_upper(sentence)
    # If config specifies, convert contractions eg "I'll" -> 'I will'
    if expand_conts:
        sentence = expand_contractions(sentence)
    # If config specifies, attempt to correct any misspelled words
    if fix_spelling:
        sentence = str(correct_spelling(sentence))
    ignore_words + [x.capitalize() for x in ignore_words]
    # Tokenize sentence
    tokenized = nltk.word_tokenize(sentence)
    # If config specifies, check to see if sentence contains any
    # nouns that can also be a verb (end, dance, cut, dress, etc)
    # and count as a verb. TODO: this needs more thought,
    # a single word is sufficient criteria
    noun_could_be_verb = False
    if check_ambiguous_verb_nouns:
        for word in tokenized:
            if possible_verb(word):
                noun_could_be_verb = True
    pos_tagged = nltk.pos_tag(tokenized)
    pos_list = [x[1] for x in pos_tagged if x[0] not in ignore_words]

    if (len(nouns & set(pos_list)) > 0 and
            (len(verbs & set(pos_list)) > 0) or noun_could_be_verb):
        if save_pos_tags:
            good_missions.append(f'{sentence}\n{pos_tagged}\n\n')
        else:
            good_missions.append(f'{sentence}\n\n')
    else:
        if save_pos_tags:
            bad_missions.append(f'{sentence}\n{pos_tagged}\n\n')
        else:
            bad_missions.append(f'{sentence}\n\n')

# read input and write results to file
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