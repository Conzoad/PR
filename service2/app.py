from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/data', methods=['GET'])
def get_data():
    response = requests.get('http://service1:5000/items')
    items = response.json()
    # Filter out items with the name 'JOE'
    filtered_items = [item for item in items if item.get('name') != 'JOE']
    return jsonify(filtered_items)

@app.route('/data', methods=['POST'])
def create_data():
    data = request.json
    response = requests.post('http://service1:5000/items', json=data)
    return jsonify(response.json()), response.status_code

@app.route('/data/<int:data_id>', methods=['PUT'])
def update_data(data_id):
    data = request.json
    response = requests.put(f'http://service1:5000/items/{data_id}', json=data)
    return jsonify(response.json()), response.status_code

@app.route('/data/<int:data_id>', methods=['DELETE'])
def delete_data(data_id):
    response = requests.delete(f'http://service1:5000/items/{data_id}')
    return jsonify(response.json()), response.status_code

@app.route('/data/filter', methods=['GET'])
def filter_data():
    name = request.args.get('name')
    response = requests.get(f'http://service1:5000/items/filter', params={'value': name})
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) 