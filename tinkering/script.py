import json

with open('log.txt', 'r', encoding='utf8') as file:
    log = list(map(lambda e: e.replace('\n', ''), file.readlines()))

with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())



test_questions = [

    '- في الفقرة 2 ما الذي اضطر جورج إلى فعله لإكمال ابتكاره: (شراء مولد بقوة حصانين)',
    '؟ - ) كان أبو حيان مغرم بثلب الشعراء ( معنى ثلب (كان يهجو الكرام)',
    '? - ) كان أبو حيان مغرم بثلب الشعراء ( معنى ثلب (كان يهجو الكرام)',

]

# Turns an index of a character in a reversed string to the normal index in the non-reversed string
def flip_index(index, length):
    return length - index

# Schema [answer, question, confidence]
def analyze_cluster(cluster):
    # Get indices of answer parantheses from the reverse direction
    reverse_question = cluster[::-1]
    indices = [reverse_question.find(')'), reverse_question.find('(')]

    if any(e == -1 for e in indices):
        print(f"Failed to analyze question below, couldn't find answer indices {indices}")
        print(cluster)

    # Flip indices
    indices = list(sorted(map(lambda e: flip_index(e, len(cluster)), indices)))

    # Get substring of answer
    answer = cluster[indices[0]:indices[1] - 1]

    # Get substring of question
    question = cluster[:indices[0] - 1].strip()
    
    # Find confidence
    confidence = True
    if cluster.startswith('?') or cluster.startswith('؟'):
        confidence = False
        # Remove unnecessary question mark
        question = question[1:].strip()

    # Remove unnecessary dash
    if question.startswith('-'):
        question = question[1:].strip()

    return [answer, question, confidence]

def strip_title(line):
    title = line.split('قطعة')[1]
    title = title.replace(':', '')
    return title.strip()
    
def is_title(line):
    return line.startswith('قطعة')

def scrape_paragraph_data(index):
    data = []
    for i in range(index + 1, len(log)):
        if is_title(log[i]):
            break

        data.append(log[i])

    # Remove unrelated data
    data = list(filter(lambda e: 'مفقود' not in e and e.strip() != '', data))

    return data

# def get_closest_matches(title):
#     possibles = []
#     for i in range(len(data)):
#         paragraph = data[i]
#         p_title = paragraph["title"]
#         p_title = p_title.replace('قطعة', '').strip()

#         ratio = fuzz.ratio(title, p_title)
#         if ratio >= 100:
#             possibles.append([i, ratio])

#     possibles = list(sorted(possibles, key=lambda e: e[1], reverse=True))
#     return possibles


def find_paragraph_index(title):
    for i in range(len(data)):
        paragraph = data[i]
        p_title = paragraph["title"]
        p_title = p_title.replace('قطعة', '').strip()

        if title == p_title:
            return i
    return -1

for i in range(len(log)):
    line = log[i]
    if is_title(line):
        # Get title
        title = strip_title(line)

        # Get all questions under title
        questions = scrape_paragraph_data(i)

        # Analyze questions
        questions = list(map(lambda e: analyze_cluster(e), questions))

        # Find index of paragraph with matching title in data.json               
        match_index = find_paragraph_index(title)

        for cluster in questions:
            [answer, question, confidence] = cluster
            data[match_index]["questions"].append({
				"question": question,
				"answers": [answer, "-", "-", "-"],
				"true": answer,
				"status": f'missing{" && unsure" if not confidence else ""}'
			})


with open('john.json', 'a', encoding='utf8') as file:
    file.write(json.dumps(data, ensure_ascii=False))
        # data[i]["questions"].append({

        # })
