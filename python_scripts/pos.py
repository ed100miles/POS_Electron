import nltk
from nltk import tokenize
from nltk.corpus import wordnet as wn
import contractions
import json
from spellchecker import SpellChecker
from textblob import TextBlob

nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

sent = input()


def expand_contractions(sentence: str) -> str:
    return ' '.join(contractions.fix(word) for word in sentence.split())


def correct_spelling(sentence:str) -> str:
    spell:object = SpellChecker()
    return ' '.join(spell.correction(word) for word in sentence.split())


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
    if (
        len(nouns & set(pos_list)) > 0
        and
        (len(verbs & set(pos_list)) > 0 or noun_could_be_verb)
    ):
        print('Good Mission!')
    else:
        print('Bad Mission')
    print(pos_tagged)


check_sentence(sent)
