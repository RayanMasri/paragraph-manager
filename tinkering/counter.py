# Counts the amount of questiosn with a non-normal status relative to normal status
import json

with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())

all_statuses = []
for paragraph in data:
    statuses = list(map(lambda e: e["status"], paragraph["questions"]))
    all_statuses.append(statuses)


all_statuses = [subitem for item in all_statuses for subitem in item]

total = len(all_statuses)
normal = len(list(filter(lambda e: e == 'normal', all_statuses)))

print(f'Ignored {round(normal/total*100, 2)}% of questions')

