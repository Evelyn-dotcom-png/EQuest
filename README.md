equestpro/
│
├── app.py
├── config.py
├── models.py
├── requirements.txt
├── static/
│   ├── uploads/  # To store images and videos
│   └── css/      # Your CSS files
│
├── templates/
│   ├── base.html
│   ├── login.html
│   ├── register.html
│   ├── marketplace.html
│   ├── list_horse.html
│   ├── purchase_membership.html
│   └── contact_seller.html
│
└── forms/
    ├── forms.py
    Flask
Flask-SQLAlchemy
Flask-WTF
Flask-Login
Flask-Mail
stripe
pip install -r requirements.txt
import os
import stripe
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.utils import secure_filename
from forms.forms import RegistrationForm, LoginForm, HorseForm, ContactForm
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
stripe.api_key = app.config['STRIPE_SECRET_KEY']

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_premium = db.Column(db.Boolean, default=False)
    horses = db.relationship('Horse', backref='owner', lazy=True)

class Horse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    breed = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    video_url = db.Column(db.String(200))
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    images = db.relationship('Image', backref='horse', lazy=True)

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(200), nullable=False)
    horse_id = db.Column(db.Integer, db.ForeignKey('horse.id'), nullable=False)

# Routes
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(email=form.email.data, password=form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.password == form.password.data:
            login_user(user)
            return redirect(url_for('marketplace'))
        flash('Login unsuccessful. Please check your email and password', 'danger')
    return render_template('login.html', form=form)

@app.route('/marketplace')
@login_required
def marketplace():
    horses = Horse.query.all()
    return render_template('marketplace.html', horses=horses)

@app.route('/list_horse', methods=['GET', 'POST'])
@login_required
def list_horse():
    form = HorseForm()
    if form.validate_on_submit():
        horse = Horse(
            name=form.name.data,
            breed=form.breed.data,
            age=form.age.data,
            color=form.color.data,
            price=form.price.data,
            description=form.description.data,
            seller_id=current_user.id
        )
        db.session.add(horse)
        db.session.commit()

        # Handle video and image uploads
        if form.video.data:
            video_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(form.video.data.filename))
            form.video.data.save(video_path)
            horse.video_url = video_path

        if form.images.data:
            for image in form.images.data:
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(image.filename))
                image.save(image_path)
                img = Image(image_path=image_path, horse_id=horse.id)
                db.session.add(img)

        db.session.commit()
        flash('Horse listed successfully!', 'success')
        return redirect(url_for('marketplace'))
    return render_template('list_horse.html', form=form)

@app.route('/purchase_membership')
@login_required
def purchase_membership():
    return render_template('purchase_membership.html')

@app.route('/contact_seller/<int:horse_id>', methods=['GET', 'POST'])
@login_required
def contact_seller(horse_id):
    form = ContactForm()
    horse = Horse.query.get_or_404(horse_id)
    if form.validate_on_submit():
        # Send email or create a contact message
        flash('Message sent to seller!', 'success')
        return redirect(url_for('marketplace'))
    return render_template('contact_seller.html', form=form, horse=horse)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
    import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_very_secret_key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///equestpro.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = 'static/uploads'
    STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY')
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField, IntegerField, FileField
from wtforms.validators import DataRequired, Email

class RegistrationForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Register')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class HorseForm(FlaskForm):
    name = StringField('Horse Name', validators=[DataRequired()])
    breed = StringField('Breed', validators=[DataRequired()])
    age = IntegerField('Age', validators=[DataRequired()])
    color = StringField('Color', validators=[DataRequired()])
    price = IntegerField('Price', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired()])
    video = FileField('Upload Video (optional)')
    images = FileField('Upload Images (optional)', render_kw={'multiple': True})
    submit = SubmitField('List Horse')

class ContactForm(FlaskForm):
    message = TextAreaField('Message', validators=[DataRequired()])
    submit = SubmitField('Send Message')
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EQuestpro Marketplace</title>
</head>
<body>
    <header>
        <h1>EQuestpro Marketplace</h1>
        <nav>
            <a href="{{ url_for('marketplace') }}">Marketplace</a>
            {% if current_user.is_authenticated %}
                <a href="{{ url_for('logout') }}">Logout</a>
            {% else %}
                <a href="{{ url_for
