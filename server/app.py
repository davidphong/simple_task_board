from flask import Flask, jsonify, request, g
from flask_cors import CORS
import sqlite3
import os
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['DATABASE'] = os.path.join(os.path.dirname(__file__), 'database.db')

# Database setup
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(app.config['DATABASE'])
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.executescript(f.read())
        db.commit()

# Token validation decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            db = get_db()
            current_user = db.execute('SELECT * FROM users WHERE id = ?', (data['user_id'],)).fetchone()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# User authentication routes
@app.route('/api/user/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'message': 'Missing required fields!'}), 400
    
    db = get_db()
    
    # Check if user already exists
    user = db.execute('SELECT * FROM users WHERE email = ?', (data['email'],)).fetchone()
    if user:
        return jsonify({'message': 'User already exists!'}), 409
    
    # Create new user
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    
    db.execute('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
               (str(uuid.uuid4()), data['username'], data['email'], hashed_password))
    db.commit()
    
    return jsonify({'message': 'User created successfully!'}), 201

@app.route('/api/user/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields!'}), 400
    
    db = get_db()
    
    # Find user
    user = db.execute('SELECT * FROM users WHERE email = ?', (data['email'],)).fetchone()
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    # Generate token
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    }), 200

# Board routes
@app.route('/api/boards', methods=['GET'])
@token_required
def get_all_boards(current_user):
    db = get_db()
    
    # Get all boards for the user
    boards = db.execute('SELECT * FROM boards WHERE user_id = ?', 
                       (current_user['id'],)).fetchall()
    
    return jsonify({
        'boards': [{
            'id': board['id'],
            'name': board['name'],
            'description': board['description']
        } for board in boards]
    }), 200

@app.route('/api/boards', methods=['POST'])
@token_required
def create_board(current_user):
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Board name is required!'}), 400
    
    board_id = str(uuid.uuid4())
    
    db = get_db()
    db.execute('INSERT INTO boards (id, name, description, user_id) VALUES (?, ?, ?, ?)',
               (board_id, data['name'], data.get('description', ''), current_user['id']))
    
    # Create default tasks
    tasks = [
        {'name': 'Task in Progress', 'description': 'A task that is currently in progress', 'status': 'In Progress', 'board_id': board_id},
        {'name': 'Task Completed', 'description': 'A task that has been completed', 'status': 'Completed', 'board_id': board_id},
        {'name': 'Task Won\'t Do', 'description': 'A task that won\'t be done', 'status': 'Won\'t do', 'board_id': board_id}
    ]
    
    for task in tasks:
        db.execute('INSERT INTO tasks (id, name, description, status, board_id) VALUES (?, ?, ?, ?, ?)',
                   (str(uuid.uuid4()), task['name'], task['description'], task['status'], board_id))
    
    db.commit()
    
    return jsonify({'message': 'Board created successfully!', 'board_id': board_id}), 201

@app.route('/api/boards/<board_id>', methods=['GET'])
@token_required
def get_board(current_user, board_id):
    db = get_db()
    
    # Get board
    board = db.execute('SELECT * FROM boards WHERE id = ? AND user_id = ?', 
                       (board_id, current_user['id'])).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    # Get tasks
    tasks = db.execute('SELECT * FROM tasks WHERE board_id = ?', (board_id,)).fetchall()
    
    return jsonify({
        'board': {
            'id': board['id'],
            'name': board['name'],
            'description': board['description']
        },
        'tasks': [{
            'id': task['id'],
            'name': task['name'],
            'description': task['description'],
            'status': task['status'],
            'icon': task['icon']
        } for task in tasks]
    }), 200

@app.route('/api/boards/<board_id>', methods=['PUT'])
@token_required
def update_board(current_user, board_id):
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided!'}), 400
    
    db = get_db()
    
    # Check if board exists
    board = db.execute('SELECT * FROM boards WHERE id = ? AND user_id = ?', 
                       (board_id, current_user['id'])).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    # Update board
    db.execute('UPDATE boards SET name = ?, description = ? WHERE id = ?',
               (data.get('name', board['name']), data.get('description', board['description']), board_id))
    db.commit()
    
    return jsonify({'message': 'Board updated successfully!'}), 200

@app.route('/api/boards/<board_id>', methods=['DELETE'])
@token_required
def delete_board(current_user, board_id):
    db = get_db()
    
    # Check if board exists
    board = db.execute('SELECT * FROM boards WHERE id = ? AND user_id = ?', 
                       (board_id, current_user['id'])).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    # Delete board
    db.execute('DELETE FROM boards WHERE id = ?', (board_id,))
    
    # Delete tasks
    db.execute('DELETE FROM tasks WHERE board_id = ?', (board_id,))
    
    db.commit()
    
    return jsonify({'message': 'Board deleted successfully!'}), 200

# Task routes
@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user):
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('board_id'):
        return jsonify({'message': 'Task name and board_id are required!'}), 400
    
    db = get_db()
    
    # Check if board exists and belongs to user
    board = db.execute('SELECT * FROM boards WHERE id = ? AND user_id = ?', 
                       (data['board_id'], current_user['id'])).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    task_id = str(uuid.uuid4())
    
    db.execute('INSERT INTO tasks (id, name, description, status, icon, board_id) VALUES (?, ?, ?, ?, ?, ?)',
               (task_id, data['name'], data.get('description', ''), 
                data.get('status', 'In Progress'), data.get('icon', ''), data['board_id']))
    db.commit()
    
    return jsonify({'message': 'Task created successfully!', 'task_id': task_id}), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided!'}), 400
    
    db = get_db()
    
    # Get task
    task = db.execute('SELECT tasks.*, boards.user_id FROM tasks JOIN boards ON tasks.board_id = boards.id WHERE tasks.id = ?', 
                      (task_id,)).fetchone()
    
    if not task or task['user_id'] != current_user['id']:
        return jsonify({'message': 'Task not found!'}), 404
    
    # Update task
    db.execute('UPDATE tasks SET name = ?, description = ?, status = ?, icon = ? WHERE id = ?',
               (data.get('name', task['name']), data.get('description', task['description']),
                data.get('status', task['status']), data.get('icon', task['icon']), task_id))
    db.commit()
    
    return jsonify({'message': 'Task updated successfully!'}), 200

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    db = get_db()
    
    # Get task
    task = db.execute('SELECT tasks.*, boards.user_id FROM tasks JOIN boards ON tasks.board_id = boards.id WHERE tasks.id = ?', 
                      (task_id,)).fetchone()
    
    if not task or task['user_id'] != current_user['id']:
        return jsonify({'message': 'Task not found!'}), 404
    
    # Delete task
    db.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    db.commit()
    
    return jsonify({'message': 'Task deleted successfully!'}), 200

if __name__ == '__main__':
    if not os.path.exists(app.config['DATABASE']):
        init_db()
    app.run(debug=True) 